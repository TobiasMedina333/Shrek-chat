// views/about.js
// Responsabilidad: renderizar la vista informativa sobre el proyecto y el personaje.

export function renderAbout() {
  return `
    <section class="about-card">
      <h1>Acerca del proyecto</h1>
      <p>
        <strong>Shrek Chat</strong> es una prueba de concepto (POC) desarrollada por
        ComicSansCon para explorar experiencias de chat conversacional con personajes
        ficticios usando inteligencia artificial generativa.
      </p>

      <h2>El personaje</h2>
      <p>
        Shrek es un ogro que vive en un pantano y protagoniza la saga de películas de
        DreamWorks Animation. Es gruñón por fuera pero leal y noble por dentro; comparte
        su vida con su esposa Fiona y su inseparable (y parlanchín) amigo Burro. Su frase
        más célebre compara a los ogros con las cebollas: ambos tienen capas.
      </p>

      <h2>Cómo funciona</h2>
      <p>
        El frontend es una Single Page Application escrita en JavaScript vanilla, sin
        frameworks, que navega entre vistas usando la History API del navegador. Cada
        mensaje del usuario se envía a una función serverless de Vercel, que arma un
        prompt de sistema con la personalidad de Shrek y consulta a la API de Google
        Gemini. La respuesta vuelve al navegador y se muestra en el chat.
      </p>

      <h2>Stack técnico</h2>
      <div class="tech-tags">
        <span class="tech-tag">JavaScript ES Modules</span>
        <span class="tech-tag">HTML5 + CSS3</span>
        <span class="tech-tag">History API</span>
        <span class="tech-tag">Fetch API</span>
        <span class="tech-tag">Vercel Serverless Functions</span>
        <span class="tech-tag">Google Gemini API</span>
        <span class="tech-tag">Vitest</span>
      </div>

      <h2>Alcance</h2>
      <p>
        Esta POC busca validar la experiencia antes de invertir en una versión ampliada
        del producto: no incluye autenticación, persistencia en base de datos ni múltiples
        personajes. El historial de conversación vive solo en memoria del navegador durante
        la sesión.
      </p>
    </section>
  `;
}
