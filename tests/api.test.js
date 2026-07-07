import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendChatMessage } from "../public/js/api.js";

describe("sendChatMessage", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve la respuesta del personaje cuando la API responde OK", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ reply: "¡Fuera de mi pantano!" }),
    });

    const reply = await sendChatMessage("Hola Shrek", []);

    expect(reply).toBe("¡Fuera de mi pantano!");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("envía el mensaje y el historial en el cuerpo de la petición", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ reply: "Ajá" }),
    });

    const history = [{ role: "user", text: "hola" }];
    await sendChatMessage("¿Cómo estás?", history);

    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.message).toBe("¿Cómo estás?");
    expect(body.history).toEqual(history);
  });

  it("lanza un error con el mensaje del servidor cuando la respuesta no es OK", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "El pantano está nublado." }),
    });

    await expect(sendChatMessage("Hola", [])).rejects.toThrow("El pantano está nublado.");
  });

  it("lanza un error si fetch falla por problemas de red", async () => {
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(sendChatMessage("Hola", [])).rejects.toThrow(
      "No se pudo conectar con el pantano"
    );
  });

  it("lanza un error si la respuesta no trae 'reply'", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await expect(sendChatMessage("Hola", [])).rejects.toThrow("no respondió nada");
  });
});
