import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerRoute, registerNotFound, initRouter, navigate } from "../public/js/router.js";

describe("router", () => {
  let appEl;

  beforeEach(() => {
    document.body.innerHTML = `
      <nav>
        <a href="/home" data-link data-route="home">Inicio</a>
        <a href="/chat" data-link data-route="chat">Chat</a>
      </nav>
      <main id="app" tabindex="-1"></main>
    `;
    appEl = document.getElementById("app");
    window.history.pushState({}, "", "/home");

    registerRoute("/home", () => "<p>home</p>");
    registerRoute("/chat", () => "<p>chat</p>");
    registerNotFound(() => "<p>404</p>");
  });

  it("renderiza la ruta correspondiente a la URL actual al iniciar", async () => {
    await initRouter(appEl);
    expect(appEl.innerHTML).toContain("home");
  });

  it("navega a otra ruta sin recargar la página y actualiza el DOM", async () => {
    await initRouter(appEl);
    await navigate("/chat");

    expect(appEl.innerHTML).toContain("chat");
    expect(window.location.pathname).toBe("/chat");
  });

  it("marca el link de navegación activo según la ruta actual", async () => {
    await initRouter(appEl);
    await navigate("/chat");

    const chatLink = document.querySelector('[data-route="chat"]');
    const homeLink = document.querySelector('[data-route="home"]');

    expect(chatLink.classList.contains("active")).toBe(true);
    expect(homeLink.classList.contains("active")).toBe(false);
  });

  it("renderiza la vista 404 para rutas no registradas", async () => {
    await initRouter(appEl);
    await navigate("/no-existe");

    expect(appEl.innerHTML).toContain("404");
  });
});
