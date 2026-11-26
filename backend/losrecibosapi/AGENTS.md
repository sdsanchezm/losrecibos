# AGENTS.md

Los Recibos API. NestJS 12 on Express, ESM, Vitest, oxlint.

## Layout

- `src/main.ts` only boots the process. `src/app.setup.ts` is the shared HTTP setup (prefix, URI versioning, CORS, `ValidationPipe`, exception filter) and it initializes the app. Call `configureApp` once before `listen`. End-to-end tests must use it so they hit the same pipeline as production.
- `src/app.module.ts` is the composition root. Feature code lives in `src/<feature>/` and is imported from there.
- `src/config` is the only place that reads and validates the environment. Everywhere else uses `ConfigService`.
- `src/database` owns the PostgreSQL pool. It reads that validated environment. Inject `DatabaseService` for queries.
- `src/common/filters/all-exceptions.filter.ts` owns the HTTP error JSON shape.

## Conventions

- Relative imports use the `.js` extension. Do not add path aliases; `node dist/main` does not rewrite them.
- Constructor injection. `typescript/no-explicit-any` is an error.
- Request bodies use class-validator DTOs. The global pipe whitelists unknown fields and rejects them.
- Do not put secrets in source. `.env` stays untracked; document new variables in `.env.example`.

## Commands

- `npm run start:dev`
- `npm test`
- `npm run test:e2e`
- `npm run lint`
- `npm run typecheck`
