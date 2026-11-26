# Los Recibos API

HTTP API for Los Recibos. NestJS 12, TypeScript, Vitest.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set the PostgreSQL credentials. The API loads that file on startup.

```powershell
Copy-Item .env.example .env
```

```bash
npm run start:dev
```

Development and production open a PostgreSQL pool and run `SELECT 1` before listening. `NODE_ENV=test` skips that check. `GET /api/v1/health` returns `{ "status": "ok", "timestamp": "<iso>" }`.

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

## Tests

Run these from `losrecibosapi` after `npm install`.

```bash
npm test
```

Unit tests are the `*.spec.ts` files next to the code they cover. Vitest runs them once and exits.

```bash
npm run test:watch
```

Reruns unit tests when a file changes.

```bash
npm run test:cov
```

Runs the unit tests and writes a coverage report.

```bash
npm run test:e2e
```

End-to-end tests live in `test/` and use the `*.e2e-spec.ts` suffix. They boot the app through `configureApp`, so requests go through the same prefix, validation, and error handling as a running server.

The test runner sets `NODE_ENV=test`, which skips the PostgreSQL connection check. `vitest.config.ts` and `vitest.config.e2e.ts` supply `PGUSER`, `PGPASSWORD`, and `PGDATABASE`. A running database is not required.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | `development`, `test`, or `production` |
| `PORT` | `3000` | HTTP port |
| `API_PREFIX` | `api` | Global path prefix. Version `v1` is appended after it. |
| `CORS_ORIGINS` | empty | Comma-separated origins. Empty disables CORS. `*` allows any origin without credentials. |
| `PGHOST` | `localhost` | PostgreSQL host. Ignored when `DATABASE_URL` is set. |
| `PGPORT` | `5432` | PostgreSQL port. Ignored when `DATABASE_URL` is set. |
| `PGUSER` | | Database user. Required unless `DATABASE_URL` is set. |
| `PGPASSWORD` | | Database password. Required unless `DATABASE_URL` is set. An empty value is allowed. |
| `PGDATABASE` | | Database name. Required unless `DATABASE_URL` is set. |
| `DATABASE_URL` | empty | `postgresql://` URL. When set, it replaces the `PG*` connection settings. |
| `PGSSLMODE` | `disable` | `disable`, `require`, `verify-ca`, or `verify-full`. |

## Layout

```
src/
  main.ts                 process entry
  app.module.ts           composition root
  app.setup.ts            prefix, versioning, CORS, validation, errors
  config/                 environment validation
  database/               PostgreSQL connection pool
  common/filters/         HTTP error body
  health/                 liveness route
```

Add a feature as `src/<feature>/` with its own module, controller, and service, then import that module from `AppModule`. Read configuration through `ConfigService`, not `process.env`. Inject `DatabaseService` to query PostgreSQL.
