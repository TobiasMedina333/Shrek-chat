// router.js
// Router mínimo basado en History API: sin recargas de página, URLs reales
// (/home, /chat, /about), soporte de back/forward, e intercepta clicks en
// enlaces internos marcados con [data-link].

const routes = new Map();
let notFoundHandler = () => "<p>Página no encontrada.</p>";
let appEl = null;

export function registerRoute(path, renderFn) {
  routes.set(path, renderFn);
}

export function registerNotFound(renderFn) {
  notFoundHandler = renderFn;
}

function normalizePath(pathname) {
  if (pathname === "/" || pathname === "") return "/home";
  return pathname.replace(/\/+$/, "") || "/home";
}

async function renderCurrentRoute() {
  const path = normalizePath(window.location.pathname);
  const renderFn = routes.get(path) || notFoundHandler;

  updateActiveNavLink(path);

  const result = await renderFn(appEl);
  if (typeof result === "string") {
    appEl.innerHTML = result;
  }
  // Mueve el foco al contenedor principal para accesibilidad al navegar.
  appEl.focus();
}

function updateActiveNavLink(path) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const isActive = `/${link.dataset.route}` === path;
    link.classList.toggle("active", isActive);
  });
}

export function navigate(path) {
  if (normalizePath(window.location.pathname) === normalizePath(path)) {
    return renderCurrentRoute();
  }
  window.history.pushState({}, "", path);
  return renderCurrentRoute();
}

function handleLinkClick(event) {
  const link = event.target.closest("[data-link]");
  if (!link) return;

  const url = new URL(link.href);
  if (url.origin !== window.location.origin) return; // enlaces externos, dejar que naveguen normal

  event.preventDefault();
  navigate(url.pathname);
}

export function initRouter(appContainer) {
  appEl = appContainer;

  document.body.addEventListener("click", handleLinkClick);
  window.addEventListener("popstate", renderCurrentRoute);

  return renderCurrentRoute();
}
