# 🧅 Shrek Chat — POC

Prueba de concepto de ComicSansCon: una Single Page Application donde los usuarios
chatean con **Shrek**, el ogro de DreamWorks, usando la API de **Google Gemini**.

> ⚠️ Proyecto educativo / POC interno. No afiliado a DreamWorks Animation.

---

## 🟢 El personaje: Shrek

Shrek es un ogro gruñón por fuera pero noble por dentro, que vive feliz en su pantano
junto a su esposa Fiona y su mejor amigo (aunque no lo admita) Burro. El chatbot está
diseñado con un system prompt que lo hace responder en tono directo, sarcástico y con
humor de ogro, sin romper nunca el personaje ni revelar que es una IA.

---

## 📁 Estructura del proyecto

```
shrek-chat/
├── api/
│   └── chat.js              # Serverless function: proxy seguro a Gemini
├── public/
│   ├── index.html            # Shell de la SPA
│   ├── css/
│   │   └── styles.css        # Diseño mobile-first (tema pantano/cebolla)
│   └── js/
│       ├── main.js           # Punto de entrada, registra rutas
│       ├── router.js         # Router con History API
│       ├── api.js            # Cliente fetch hacia /api/chat
│       └── views/
│           ├── home.js
│           ├── chat.js
│           └── about.js
├── tests/
│   ├── api.test.js           # Tests del cliente fetch (mockeado)
│   ├── router.test.js        # Tests del router SPA
│   └── chat-api.test.js      # Tests de la serverless function
├── .env.example
├── vercel.json
├── vitest.config.js
└── package.json
```

---

## 🚀 Requisitos y ejecución local

### Requisitos
- Node.js 18 o superior
- Cuenta de [Vercel](https://vercel.com) y [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- API key de Google Gemini: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Pasos

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` y completar `GEMINI_API_KEY` con tu propia key. **Nunca subir `.env` al repositorio** (ya está en `.gitignore`).

3. **Ejecutar en local con Vercel Dev** (levanta el frontend estático *y* las serverless functions juntos)
   ```bash
   vercel dev
   ```
   La app queda disponible en `http://localhost:3000` (o el puerto que indique la consola).

---

## 🧪 Cómo ejecutar los tests

```bash
npm test
```

Ejecuta la suite completa con Vitest (18 tests) cubriendo:
- `tests/api.test.js`: cliente `fetch` hacia `/api/chat`, con `fetch` mockeado (sin red).
- `tests/router.test.js`: navegación SPA, rutas activas, ruta 404.
- `tests/chat-api.test.js`: armado del payload para Gemini, parseo de respuesta, y manejo de errores/rate-limit de la serverless function (con `fetch` mockeado).

Modo watch: `npm run test:watch`
Cobertura: `npm run test:coverage`

---

## ☁️ Cómo desplegar a Vercel

1. Subir el repositorio a GitHub.
2. En [vercel.com/new](https://vercel.com/new), importar el repositorio.
3. En **Project Settings → Environment Variables**, agregar:
   - `GEMINI_API_KEY` = tu API key real
   - `GEMINI_MODEL` = `gemini-1.5-flash` (opcional, tiene default)
   - `GEMINI_TEMPERATURE` = `0.9` (opcional, tiene default)
4. Deploy. Vercel detecta automáticamente `public/` como sitio estático y `api/chat.js`
   como serverless function.
5. Verificar en producción: abrir la URL asignada, navegar a `/chat` y probar una
   conversación real.

**URL pública de la aplicación desplegada:** _`https://<completar-luego-del-deploy>.vercel.app`_
*(Este entorno de desarrollo no tiene acceso a una cuenta de Vercel para completar el
deploy real; seguir los pasos de arriba para publicarla y pegar acá la URL final.)*

---

## 🖼️ Capturas de pantalla

## 🖼️ Capturas de pantalla

### Home
![Vista de inicio]<img width="1914" height="907" alt="Captura de pantalla 2026-07-08 201136" src="https://github.com/user-attachments/assets/9e868d0e-348d-425e-badd-f0948c942d5c" />

### Chat
![Conversación con Shrek]<img width="1900" height="899" alt="Captura de pantalla 2026-07-08 201157" src="https://github.com/user-attachments/assets/c9912a27-3e35-4a77-9d5b-bb5de5050be3" />

### About
![Acerca del proyecto]<img width="1901" height="904" alt="Captura de pantalla 2026-07-08 201216" src="https://github.com/user-attachments/assets/c2f7c6ce-b383-4570-b948-d1630d4f7beb" />

---

## 🤖 Registro del uso de AI en el proyecto

Este proyecto fue desarrollado con asistencia de Claude (Anthropic) como par de
programación. Uso concreto:
- Diseño de la arquitectura general (separación router / vistas / cliente API /
  serverless function) siguiendo el principio de responsabilidad única.
- Redacción del system prompt de personalidad de Shrek y ajuste de tono en español
  rioplatense.
- Generación del código base de la SPA (routing con History API, manejo de estados de
  carga/error/escritura, escape de HTML para evitar inyección en los mensajes).
- Escritura de la suite de tests con Vitest, incluyendo mocks de `fetch` para no
  depender de red real.
- Definición del sistema de diseño (paleta pantano/cebolla, tipografías, breakpoints
  mobile-first) para lograr una identidad visual propia del personaje.

Todo el código generado fue revisado, ejecutado (`npm test`, servidor estático local)
y ajustado manualmente antes de considerarlo parte del entregable.
