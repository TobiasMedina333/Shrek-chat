// views/home.js
// Responsabilidad: renderizar la vista de bienvenida. Solo genera HTML,
// no maneja fetch ni lógica de negocio.

export function renderHome() {
  return `
    <section class="home-hero">
      <span class="avatar" role="img" aria-label="Shrek">🟢</span>
      <h1>¡Fuera de mi pantano! ...bueno, pasá nomás.</h1>
      <p>
        Charlá con <strong>Shrek</strong>, el ogro más gruñón (y con mejor corazón) de todo
        el reino de Muy Muy Lejano. Contale de tu día, preguntale por Fiona, Burro o su
        amado pantano. Esta es una prueba de concepto hecha por ComicSansCon para mostrar
        cómo se ve una experiencia de chat con IA.
      </p>

      <div class="layer-list">
        <div class="layer-item"><strong>Capa 1:</strong> Interfaz de chat en tiempo real con IA</div>
        <div class="layer-item"><strong>Capa 2:</strong> Personalidad de Shrek bien definida</div>
        <div class="layer-item"><strong>Capa 3:</strong> Diseño responsive, de celular a escritorio</div>
        <div class="layer-item"><strong>Capa 4:</strong> API key protegida en el backend</div>
      </div>

      <a href="/chat" data-link class="btn btn-primary">Empezar a chatear</a>
    </section>
  `;
}
