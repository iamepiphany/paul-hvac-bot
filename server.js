import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Serve the widget JS file
app.get('/widget.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(join(__dirname, 'widget.js'));
});

// Serve demo page
app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, 'demo.html'));
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt, businessName } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const system = systemPrompt ||
    `You are a helpful assistant for ${businessName || 'this business'}.
     Be friendly, concise, and helpful. Keep responses short — 2-3 sentences max unless more detail is needed.`;

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    let reply = completion.choices[0]?.message?.content || 'Sorry, I had trouble responding.';

    // Check if the bot has collected all appointment info
    const bookMatch = reply.match(/\[BOOK\]([\s\S]*?)\[\/BOOK\]/);
    if (bookMatch) {
      try {
        const appointment = JSON.parse(bookMatch[1].trim());

        if (process.env.RESEND_API_KEY && process.env.APPOINTMENT_EMAIL) {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: process.env.APPOINTMENT_EMAIL,
            subject: `New Appointment Request — ${appointment.name || 'Customer'}`,
            html: `
              <h2>New Appointment Request</h2>
              <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;">
                <tr><td style="padding:6px 16px 6px 0;font-weight:600;">Name</td><td>${appointment.name || '—'}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;font-weight:600;">Service</td><td>${appointment.service || '—'}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;font-weight:600;">Date & Time</td><td>${appointment.datetime || '—'}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;font-weight:600;">Contact</td><td>${appointment.contact || '—'}</td></tr>
              </table>
              <p style="margin-top:16px;color:#888;font-size:13px;">Sent via website chatbot</p>
            `,
          });
          console.log(`Appointment email sent for ${appointment.name}`);
        } else {
          console.warn('Appointment detected but RESEND_API_KEY or APPOINTMENT_EMAIL not set');
        }
      } catch (e) {
        console.error('Failed to send appointment email:', e.message);
      }

      reply = reply.replace(/\[BOOK\][\s\S]*?\[\/BOOK\]/g, '').trim();
    }

    res.json({ reply });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot server running at http://localhost:${PORT}`);
  console.log(`Embed widget with: <script src="http://localhost:${PORT}/widget.js" ...></script>`);
});
