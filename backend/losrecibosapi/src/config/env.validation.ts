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

export type NodeEnv = (typeof NODE_ENVS)[number];

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
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const normalized = {
    NODE_ENV: trimmedString(config.NODE_ENV) ?? 'development',
    PORT: parsePort(config.PORT),
    API_PREFIX: trimmedString(config.API_PREFIX) ?? 'api',
    CORS_ORIGINS: trimmedString(config.CORS_ORIGINS) ?? '',
  };

  parseCorsOrigins(normalized.CORS_ORIGINS);

  const validated = plainToInstance(EnvironmentVariables, normalized);
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${formatValidationErrors(errors)}`,
    );
  }

  return validated;
}

function trimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function parsePort(value: unknown): number {
  if (value === undefined || value === null || value === '') {
    return 3000;
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
