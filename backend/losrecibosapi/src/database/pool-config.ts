import type { ConfigService } from '@nestjs/config';
import type { PoolConfig } from 'pg';
import type { ConnectionOptions } from 'node:tls';
import type {
  EnvironmentVariables,
  PgSslMode,
} from '../config/env.validation.js';

const CONNECTION_TIMEOUT_MS = 5_000;

export type DatabaseEnv = Pick<
  EnvironmentVariables,
  | 'DATABASE_URL'
  | 'PGHOST'
  | 'PGPORT'
  | 'PGUSER'
  | 'PGPASSWORD'
  | 'PGDATABASE'
  | 'PGSSLMODE'
>;

export function readDatabaseEnv(
  config: ConfigService<EnvironmentVariables, true>,
): DatabaseEnv {
  return {
    DATABASE_URL: config.get('DATABASE_URL', { infer: true }),
    PGHOST: config.get('PGHOST', { infer: true }),
    PGPORT: config.get('PGPORT', { infer: true }),
    PGUSER: config.get('PGUSER', { infer: true }),
    PGPASSWORD: config.get('PGPASSWORD', { infer: true }),
    PGDATABASE: config.get('PGDATABASE', { infer: true }),
    PGSSLMODE: config.get('PGSSLMODE', { infer: true }),
  };
}

export function createPoolConfig(env: DatabaseEnv): PoolConfig {
  const config: PoolConfig = {
    application_name: 'losrecibosapi',
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    ssl: sslOption(env.PGSSLMODE),
  };

  if (env.DATABASE_URL) {
    config.connectionString = env.DATABASE_URL;
    return config;
  }

  config.host = env.PGHOST;
  config.port = env.PGPORT;
  config.user = env.PGUSER;
  config.password = env.PGPASSWORD;
  config.database = env.PGDATABASE;
  return config;
}

export function databaseLabel(env: DatabaseEnv): string {
  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    const database = url.pathname.replace(/^\//, '') || 'postgres';
    const port = url.port || '5432';
    return `${userFromUrl(url)}@${url.hostname}:${port}/${database}`;
  }

  return `${env.PGUSER}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;
}

function sslOption(mode: PgSslMode): PoolConfig['ssl'] {
  if (mode === 'disable') {
    return false;
  }

  // libpq `require` encrypts the session and skips certificate verification.
  if (mode === 'require') {
    return { rejectUnauthorized: false };
  }

  if (mode === 'verify-ca') {
    const ssl: ConnectionOptions = {
      rejectUnauthorized: true,
      checkServerIdentity: () => undefined,
    };
    return ssl;
  }

  return { rejectUnauthorized: true };
}

function userFromUrl(url: URL): string {
  if (!url.username) {
    return 'user';
  }

  try {
    return decodeURIComponent(url.username);
  } catch {
    return url.username;
  }
}
