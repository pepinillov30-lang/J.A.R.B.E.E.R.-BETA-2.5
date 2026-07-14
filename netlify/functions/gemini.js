// Netlify Function: puente seguro hacia Google Gemini.
// La API Key (JARBEER_KEY) nunca llega al navegador.

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-1.5-flash';

const SYSTEM_PROMPT = `Eres J.A.R.B.E.E.R., el asistente inteligente de producción de una microcervecería artesanal. Tu usuario es Juanfran, maestro cervecero. Responde siempre en español, con tono profesional, técnico pero cercano, y mensajes concisos. Puedes ayudar con: gestión de lotes, recetas, documentos, cálculos de cerveza, control de fermentación, temperaturas, lúpulos, maltas y levaduras. Si no sabes algo, dilo claramente. No inventes datos que no te proporcione el usuario.`;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const key = process.env.JARBEER_KEY;
  if (!key) {
    return jsonResponse({ error: 'JARBEER_KEY is not configured' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { command } = body ?? {};
  if (!command || typeof command !== 'string') {
    return jsonResponse({ error: 'Missing command' }, 400);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }],
    });
    const result = await chat.sendMessage(command);
    const reply = result.response.text();
    return jsonResponse({ reply });
  } catch (err) {
    return jsonResponse({ error: err.message ?? 'Gemini request failed' }, 502);
  }
};
