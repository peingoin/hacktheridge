/**
 * Minimal GPT-4o-mini text call to verify your OpenAI key.
 * Uses env: VITE_OPENAI_API_KEY or OPENAI_API_KEY (dotenv loaded).
 * Run: npm run gpt:test
 */
import 'dotenv/config';

const API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = 'gpt-4o-mini';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

async function main() {
  if (!API_KEY) {
    console.error('Missing API key. Set VITE_OPENAI_API_KEY or OPENAI_API_KEY.');
    process.exit(1);
  }

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: 'You are a concise assistant.' },
      { role: 'user', content: 'Quick hello test.' }
    ]
  };

  console.log('Posting to OpenAI:', {
    endpoint: ENDPOINT,
    model: MODEL,
    body
  });

  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });

  const text = await resp.text();
  console.log('Raw response:', text);

  if (!resp.ok) {
    console.error(`Request failed: ${resp.status} ${resp.statusText}`);
    process.exit(1);
  }

  try {
    const data = JSON.parse(text);
    const output = data?.choices?.[0]?.message?.content?.trim();
    console.log('Response:', output || text);
  } catch (err) {
    console.error('Parse error:', err);
    console.log('Raw response:', text);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
