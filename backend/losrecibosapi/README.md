# Los Recibos API

HTTP API for Los Recibos. NestJS 12, TypeScript, Vitest.

## Setup

```bash
npm install
npm run start:dev
```

The app boots without a `.env` file. Copy `.env.example` to `.env` when you need to override a setting:

```powershell
Copy-Item .env.example .env
```

`GET /api/v1/health` returns `{ "status": "ok", "timestamp": "<iso>" }`.

Unknown routes and thrown HTTP exceptions use one JSON body: `statusCode`, `message`, `path`, `timestamp`. Unexpected failures return `Internal server error` and the detail stays in the server log.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run start:dev` | Watch mode |
| `npm run start:prod` | Run the compiled app |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run lint` | oxlint |
| `npm run typecheck` | Typecheck `src` and `test` |
| `npm run build` | Compile to `dist` |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
| `PORT` | `3000` | HTTP port |
| `API_PREFIX` | `api` | Global path prefix. Version `v1` is appended after it. |
| `CORS_ORIGINS` | empty | Comma-separated origins. Empty disables CORS. `*` allows any origin without credentials. |

## Layout

```
src/
  main.ts                 process entry
  app.module.ts           composition root
  app.setup.ts            prefix, versioning, CORS, validation, errors
  config/                 environment validation
  common/filters/         HTTP error body
  health/                 liveness route
```

Add a feature as `src/<feature>/` with its own module, controller, and service, then import that module from `AppModule`. Read configuration through `ConfigService`, not `process.env`.
