# Scentral Dashboard – Frontend

This directory contains the **web admin dashboard** for managing Scentral devices, products and sales. The application is built with [Nuxt 3](https://nuxt.com) (Vue 3 + Vite) and consumes the REST/MQTT backend located in `../scentral-dashboard`.

---

## Features

* Responsive UI built with [Tailwind CSS](https://tailwindcss.com)
* Authentication with JWT & refresh tokens
* Dynamic layouts and modular pages (`pages/`, `layouts/`)
* Auto-imported composables & components
* REST API integration via [Axios](https://axios-http.com)
* Realtime updates with MQTT over WebSockets
* ESLint + Prettier for code quality

---

## Prerequisites

| Dependency | Version |
|------------|---------|
| Node.js | ≥ 18.0 |
| pnpm / npm / yarn / bun | latest |

We recommend [pnpm](https://pnpm.io) for faster installs.

---

## Getting Started

1. **Install dependencies**
   ```bash
   # using pnpm (preferred)
   pnpm install
   # or npm
   npm install
   ```

2. **Environment variables** – copy the example file and edit:
   ```bash
   cp .env.example .env
   ```
   | Variable | Description | Default |
   |----------|-------------|---------|
   | `NUXT_PUBLIC_API_BASE` | Base URL of backend REST API | `http://localhost:3000/api` |
   | `NUXT_PUBLIC_MQTT_WS` | WebSocket MQTT endpoint | `ws://localhost:1884` |

3. **Run in development**
   ```bash
   pnpm dev   # or npm run dev
   ```
   Access the app at `http://localhost:3000` (port can differ if occupied).

---

## Production Build

```bash
pnpm build      # generate .output
pnpm preview    # preview production build locally
```

Nuxt creates an SSR-ready output in the `.output` directory that can be deployed to Node or serverless targets. For a static SPA, enable `ssr: false` in `nuxt.config.ts` and run `pnpm generate`.

### Docker

A simple Dockerfile is provided:
```bash
docker build -t scentral-frontend .
docker run -d -p 3000:3000 --env-file .env --name scentral-frontend scentral-frontend
```

---

## Project Structure (important folders)

```
├── assets/        # Uncompiled assets (scss, images)
├── components/    # Vue components (auto-imported)
├── composables/   # Reusable composables (auto-imported)
├── layouts/       # App layouts (default, empty…)
├── middleware/    # Route middleware (auth, guest)
├── pages/         # Route-driven pages
├── plugins/       # Client/server plugins (axios, mqtt)
├── public/        # Static files served at /
├── nuxt.config.ts # Nuxt configuration
└── README.md
```

---

## Lint & Format

```bash
pnpm lint       # eslint
pnpm format     # prettier –write
```

---

## Contribution Guidelines

1. Fork the repository and create a feature branch: `git checkout -b feat/my-feature`  
2. Commit using conventional commits.  
3. Open a Pull Request.

---

## License

MIT © 2025 Scentral

