import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.get('/widget.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(join(__dirname, 'widget.js'));
});

app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, 'demo.html'));
});

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
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I had trouble responding.';
    res.json({ reply });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot server running at http://localhost:${PORT}`);
});
