import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler, { buildGeminiPayload, extractReply } from "../api/chat.js";

function createMockRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    headers: {},
  };
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload) => {
    res.body = payload;
    return res;
  });
  res.setHeader = vi.fn((key, value) => {
    res.headers[key] = value;
  });
  return res;
}

describe("buildGeminiPayload", () => {
  it("traduce el rol 'character' del historial a 'model' para Gemini", () => {
    const payload = buildGeminiPayload([{ role: "character", text: "Hola humano" }], "¿Qué tal?");

    expect(payload.contents[0]).toEqual({ role: "model", parts: [{ text: "Hola humano" }] });
    expect(payload.contents.at(-1)).toEqual({ role: "user", parts: [{ text: "¿Qué tal?" }] });
  });

  it("incluye el system prompt de Shrek en system_instruction", () => {
    const payload = buildGeminiPayload([], "hola");
    expect(payload.system_instruction.parts[0].text).toContain("Shrek");
  });
});

describe("extractReply", () => {
  it("extrae el texto de la primera respuesta candidata de Gemini", () => {
    const geminiData = {
      candidates: [{ content: { parts: [{ text: "¡Fuera de mi pantano!" }] } }],
    };
    expect(extractReply(geminiData)).toBe("¡Fuera de mi pantano!");
  });

  it("devuelve null si no hay candidatos en la respuesta", () => {
    expect(extractReply({})).toBeNull();
  });
});

describe("handler /api/chat", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "fake-key";
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("responde 405 si el método no es POST", async () => {
    const req = { method: "GET" };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("responde 400 si falta el campo 'message'", async () => {
    const req = { method: "POST", body: { history: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("responde 500 si no hay GEMINI_API_KEY configurada", async () => {
    delete process.env.GEMINI_API_KEY;
    const req = { method: "POST", body: { message: "hola" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("devuelve la respuesta del personaje cuando Gemini responde OK", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Los ogros somos como las cebollas." }] } }],
      }),
    });

    const req = { method: "POST", body: { message: "Contame sobre vos", history: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.body.reply).toBe("Los ogros somos como las cebollas.");
  });

  it("responde 429 cuando Gemini devuelve rate limit", async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 429, text: async () => "" });

    const req = { method: "POST", body: { message: "hola", history: [] } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
  });
});
