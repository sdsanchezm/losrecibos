import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  validateSync,
  type ValidationError,
} from 'class-validator';
import { parseCorsOrigins } from './cors-origins.js';

const NODE_ENVS = ['development', 'test', 'production'] as const;

export const PG_SSL_MODES = [
  'disable',
  'require',
  'verify-ca',
  'verify-full',
] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];
export type PgSslMode = (typeof PG_SSL_MODES)[number];

export class EnvironmentVariables {
  @IsIn(NODE_ENVS)
  NODE_ENV!: NodeEnv;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @Matches(/^[A-Za-z0-9]+(?:[/-][A-Za-z0-9]+)*$/)
  API_PREFIX!: string;

  @IsString()
  CORS_ORIGINS!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  PGHOST!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PGPORT!: number;

  @IsString()
  PGUSER!: string;

  @IsString()
  PGPASSWORD!: string;

  @IsString()
  PGDATABASE!: string;

  @IsIn(PG_SSL_MODES)
  PGSSLMODE!: PgSslMode;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const password = passwordFrom(config.PGPASSWORD);
  const normalized = {
    NODE_ENV: trimmedString(config.NODE_ENV) ?? 'development',
    PORT: parsePort(config.PORT, 3000),
    API_PREFIX: trimmedString(config.API_PREFIX) ?? 'api',
    CORS_ORIGINS: trimmedString(config.CORS_ORIGINS) ?? '',
    DATABASE_URL: parseDatabaseUrl(config.DATABASE_URL),
    PGHOST: trimmedString(config.PGHOST) ?? 'localhost',
    PGPORT: parsePort(config.PGPORT, 5432),
    PGUSER: trimmedString(config.PGUSER) ?? '',
    PGPASSWORD: password.value,
    PGDATABASE: trimmedString(config.PGDATABASE) ?? '',
    PGSSLMODE: trimmedString(config.PGSSLMODE)?.toLowerCase() ?? 'disable',
  };

  parseCorsOrigins(normalized.CORS_ORIGINS);

  const validated = plainToInstance(EnvironmentVariables, normalized);
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${formatValidationErrors(errors)}`,
    );
  }

  if (!validated.DATABASE_URL) {
    const missing: string[] = [];
    if (!validated.PGUSER) {
      missing.push('PGUSER');
    }
    if (!password.provided) {
      missing.push('PGPASSWORD');
    }
    if (!validated.PGDATABASE) {
      missing.push('PGDATABASE');
    }
    if (missing.length > 0) {
      throw new Error(
        `Missing ${missing.join(', ')}. Set them in .env, or set DATABASE_URL.`,
      );
    }
  }

  return validated;
}

function passwordFrom(value: unknown): { provided: boolean; value: string } {
  if (typeof value !== 'string') {
    return { provided: false, value: '' };
  }

  return { provided: true, value: value.trim() };
}

function parseDatabaseUrl(value: unknown): string {
  const raw = trimmedString(value);
  if (raw === undefined) {
    return '';
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new Error('DATABASE_URL must use the postgresql:// scheme');
  }

  return raw;
}

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function parsePort(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return typeof value === 'number' ? value : Number(value);
}

function formatValidationErrors(errors: ValidationError[]): string {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children?.length) {
      messages.push(formatValidationErrors(error.children));
    }
  }

  return messages.filter((message) => message.length > 0).join('; ');
}
