// api.js
// Responsabilidad única: comunicarse con la serverless function /api/chat.
// No transforma datos de UI ni renderiza nada; solo hace la petición y
// devuelve datos o lanza errores claros para que el llamador decida qué mostrar.

/**
 * Envía un mensaje del usuario al proxy de Gemini junto con el historial
 * de la conversación, y devuelve la respuesta del personaje.
 *
 * @param {string} message - Texto escrito por el usuario.
 * @param {{role: 'user'|'character', text: string}[]} history - Historial previo.
 * @returns {Promise<string>} La respuesta de texto del personaje.
 * @throws {Error} Si la petición falla o el servidor responde con error.
 */
export async function sendChatMessage(message, history = []) {
  let response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
  } catch (networkError) {
    throw new Error("No se pudo conectar con el pantano. Revisá tu conexión a internet.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Respuesta inesperada del servidor.");
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error del servidor (${response.status}).`);
  }

  if (!data.reply) {
    throw new Error("El personaje no respondió nada. Probá de nuevo.");
  }

  return data.reply;
}
