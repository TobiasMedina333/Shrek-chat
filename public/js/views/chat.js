// views/chat.js
// Responsabilidad: manejar la vista de chat completa — estado de la conversación,
// renderizado de mensajes, envío de formularios y comunicación con la API a través
// de sendChatMessage(). El historial vive en memoria de módulo, por lo que persiste
// mientras se navega entre vistas dentro de la misma sesión (se pierde al recargar).

import { sendChatMessage } from "../api.js";

/** @type {{role: 'user'|'character'|'system', text: string}[]} */
const conversation = [];
let isSending = false;

export function renderChat(appEl) {
  appEl.innerHTML = template();

  const messagesEl = appEl.querySelector("#chat-messages");
  const formEl = appEl.querySelector("#chat-form");
  const inputEl = appEl.querySelector("#chat-input");
  const sendBtn = appEl.querySelector("#chat-send");

  renderMessages(messagesEl);
  scrollToBottom(messagesEl);

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSend({ messagesEl, inputEl, sendBtn });
  });
}

function template() {
  return `
    <section class="chat-shell">
      <div class="chat-header">
        <span aria-hidden="true">🟢</span>
        <span>Shrek</span>
      </div>
      <div id="chat-messages" class="chat-messages" role="log" aria-live="polite"></div>
      <form id="chat-form" class="chat-form">
        <input
          id="chat-input"
          class="chat-input"
          type="text"
          placeholder="Escribile algo a Shrek..."
          autocomplete="off"
          maxlength="1000"
          aria-label="Mensaje para Shrek"
          required
        />
        <button id="chat-send" type="submit" class="btn btn-primary chat-send" aria-label="Enviar mensaje">➤</button>
      </form>
    </section>
  `;
}

async function handleSend({ messagesEl, inputEl, sendBtn }) {
  const text = inputEl.value.trim();
  if (!text || isSending) return;

  conversation.push({ role: "user", text });
  renderMessages(messagesEl);
  scrollToBottom(messagesEl);

  inputEl.value = "";
  setSending(true, { inputEl, sendBtn });
  showTypingIndicator(messagesEl);

  try {
    const historyForApi = conversation
      .filter((m) => m.role === "user" || m.role === "character")
      .slice(0, -1); // no incluir el mensaje recién agregado, va aparte como "message"

    const reply = await sendChatMessage(text, historyForApi);

    conversation.push({ role: "character", text: reply });
  } catch (err) {
    conversation.push({
      role: "system",
      text: err instanceof Error ? err.message : "Ocurrió un error inesperado.",
    });
  } finally {
    hideTypingIndicator(messagesEl);
    setSending(false, { inputEl, sendBtn });
    renderMessages(messagesEl);
    scrollToBottom(messagesEl);
    inputEl.focus();
  }
}

function setSending(sending, { inputEl, sendBtn }) {
  isSending = sending;
  inputEl.disabled = sending;
  sendBtn.disabled = sending;
}

function showTypingIndicator(messagesEl) {
  const el = document.createElement("div");
  el.id = "typing-indicator";
  el.className = "typing-indicator";
  el.setAttribute("aria-label", "Shrek está escribiendo");
  el.innerHTML = "<span></span><span></span><span></span>";
  messagesEl.appendChild(el);
  scrollToBottom(messagesEl);
}

function hideTypingIndicator(messagesEl) {
  messagesEl.querySelector("#typing-indicator")?.remove();
}

/** Transforma el estado de la conversación en nodos del DOM. Separación clara
 *  entre transformación de datos (aquí) y el HTML de cada burbuja (renderBubble). */
function renderMessages(messagesEl) {
  messagesEl.innerHTML = conversation.map(renderBubble).join("");
}

function renderBubble(msg) {
  const cssClass = { user: "msg-user", character: "msg-character", system: "msg-system" }[msg.role];
  return `<div class="msg ${cssClass}">${escapeHtml(msg.text)}</div>`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function scrollToBottom(messagesEl) {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/** Expuesto solo para tests: permite resetear el estado del módulo entre casos. */
export function _resetConversationForTests() {
  conversation.length = 0;
  isSending = false;
}
