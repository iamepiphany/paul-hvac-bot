# Chatbot Setup — Claude Instructions

This is a plug-and-play AI chatbot widget powered by Groq. Before writing any code, run the setup flow below to configure it for the business.

## On First Open

Introduce yourself briefly, then ask the following questions **one at a time**. Wait for the answer before moving to the next. Do not ask multiple questions in one message.

---

## Setup Questions (ask in order)

1. **Business name** — "What's the name of the business this chatbot is for?"

2. **What they do** — "Give me a quick rundown of what the business does and what services it offers. The more detail the better — this becomes the bot's brain."

3. **Brand color** — "What's the primary brand color? You can give me a hex code, or describe it (e.g. 'dark green', 'navy blue') and I'll pick the closest match."

4. **Bot name** — "What should the chatbot be called? (e.g. 'Maya', 'Support Bot', or just the business name)"

5. **Greeting message** — "What should the bot say when someone first opens the chat? Keep it short and friendly."

6. **Tone & personality** — "How should the bot sound? (e.g. 'professional and concise', 'casual and friendly', 'enthusiastic and helpful')"

7. **Off-limits topics** — "Is there anything the bot should never talk about or always redirect? (e.g. pricing, competitors, refund policy)"

8. **Service area or extra context** — "Anything else the bot should know? Service area, hours, a specific CTA, FAQs, etc."

---

## After Collecting Answers

1. Build a `systemPrompt` using all the answers. It should:
   - State the bot's name and the business it works for
   - Describe what the business does (from question 2)
   - Set the tone (from question 6)
   - Include any off-limits rules (from question 7)
   - Include extra context like hours, service area, FAQs (from question 8)
   - End with: "Keep responses to 2-3 sentences unless the user needs more detail."

2. Generate the final embed snippet and show it to the user like this:

```html
<!-- Paste this into your website's HTML, just before </body> -->
<script
  src="YOUR_SERVER_URL/widget.js"
  data-server="YOUR_SERVER_URL"
  data-name="BOT_NAME"
  data-color="#HEX_COLOR"
  data-greeting="GREETING_MESSAGE"
  data-prompt="SYSTEM_PROMPT"
  data-placeholder="Type a message..."
></script>
```

3. Tell them to replace `YOUR_SERVER_URL` with wherever they host the server (e.g. `http://localhost:3001` for local dev).

4. Remind them they need a `.env` file with their Groq API key:
```
GROQ_API_KEY=their_key_here
GROQ_MODEL=llama-3.1-8b-instant
PORT=3001
```

5. Tell them to run `npm install` then `node server.js` to start.

---

## Rules

- Never skip questions — every answer shapes the system prompt
- Never write code or touch `widget.js` or `server.js` — those are the template, leave them alone
- If the user skips a question, use a sensible default and note it
- If the brand color is described (not a hex), pick the closest reasonable hex and explain your choice
