// main.js
// Punto de entrada de la aplicación: registra las rutas y arranca el router.

import { initRouter, registerRoute, registerNotFound } from "./router.js";
import { renderHome } from "./views/home.js";
import { renderChat } from "./views/chat.js";
import { renderAbout } from "./views/about.js";

registerRoute("/home", renderHome);
registerRoute("/chat", renderChat);
registerRoute("/about", renderAbout);
registerNotFound(() => `
  <section class="about-card">
    <h1>404</h1>
    <p>Ni Shrek encontró esta página. <a href="/home" data-link>Volvé al pantano.</a></p>
  </section>
`);

const appEl = document.getElementById("app");
initRouter(appEl);
