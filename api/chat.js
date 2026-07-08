// api/chat.js
// Vercel Serverless Function: actúa como proxy seguro entre el frontend y la API
// de Google Gemini. La API key vive solo en variables de entorno del servidor,
// nunca se expone en el bundle del cliente.

const SHREK_SYSTEM_PROMPT = `Sos Shrek, el ogro verde y gruñón que vive feliz en su pantano,
protagonista de la saga de películas de DreamWorks. Estas chateando por texto con un usuario
que quiere conocerte. Reglas de personalidad:

- Hablás en español rioplatense, de forma directa, gruñona pero con buen fondo.
- Te encanta tu pantano, tu esposa Fiona, tu mejor amigo Burro (aunque digas que te molesta)
  y odiás que invadan tu privacidad, sobre todo los cuentos de hadas metidos en tu terreno.
- Usás alguna metáfora tipo "los ogros somos como las cebollas, tenemos capas" cuando viene al caso,
  sin repetirla en cada mensaje.
- Sos honesto y algo sarcástico, pero nunca cruel ni ofensivo de verdad; el mal humor es de fachada.
- Respuestas cortas o medianas (2 a 5 oraciones), como en una conversación de chat real, no ensayos.
- No rompas el personaje, no digas que sos una IA ni menciones a Gemini, Google o Anthropic.
- Si te preguntan algo fuera de tu mundo (política actual, datos técnicos, etc.), respondelo
  a tu manera de ogro que no tiene idea de la tecnología humana, con humor.`;

function buildGeminiPayload(history, userMessage) {
  // Traducimos el historial (roles "user"/"character") al formato que espera Gemini
  // ("user"/"model"), y anteponemos el system prompt como primer turno del modelo.
  const contents = [];

  for (const turn of history) {
    contents.push({
      role: turn.role === "character" ? "model" : "user",
      parts: [{ text: turn.text }],
    });
  }

  contents.push({ role: "user", parts: [{ text: userMessage }] });

  return {
    system_instruction: { parts: [{ text: SHREK_SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: Number(process.env.GEMINI_TEMPERATURE ?? 0.9),
      maxOutputTokens: 300,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido. Usá POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "El servidor no tiene configurada GEMINI_API_KEY." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "JSON inválido en el cuerpo de la petición." });
    }
  }

  const { message, history } = body ?? {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Falta el campo 'message' (string no vacío)." });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: "El mensaje es demasiado largo (máximo 1000 caracteres)." });
  }

  const safeHistory = Array.isArray(history) ? history.slice(-20) : [];
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGeminiPayload(safeHistory, message)),
    });

    if (geminiResponse.status === 429) {
      return res.status(429).json({
        error: "Shrek necesita un respiro. Se alcanzó el límite de peticiones, probá de nuevo en unos segundos.",
      });
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Error de Gemini API:", geminiResponse.status, errText);
      return res.status(502).json({ error: "El pantano está nublado. Falló la conexión con la IA." });
    }

    const data = await geminiResponse.json();
    const reply = extractReply(data);

    if (!reply) {
      return res.status(502).json({ error: "Shrek no encontró las palabras. Respuesta vacía de la IA." });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Error inesperado en /api/chat:", err);
    return res.status(500).json({ error: "Error interno del servidor. Intentá de nuevo." });
  }
}

function extractReply(geminiData) {
  const candidate = geminiData?.candidates?.[0];
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) return null;
  return parts.map((p) => p.text ?? "").join("").trim() || null;
}

export { buildGeminiPayload, extractReply, SHREK_SYSTEM_PROMPT };
