import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { databaseLabel, readDatabaseEnv } from './pool-config.js';

export const PG_POOL = Symbol('PG_POOL');

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly nodeEnv: EnvironmentVariables['NODE_ENV'];
  private readonly label: string;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    const databaseEnv = readDatabaseEnv(config);
    this.nodeEnv = config.get('NODE_ENV', { infer: true });
    this.label = databaseLabel(databaseEnv);
    this.pool.on('error', (error) => {
      this.logger.error(
        `PostgreSQL client error (${this.label}): ${error.message}`,
      );
    });
  }

  async onModuleInit(): Promise<void> {
    // Development and production verify the connection before serving traffic.
    // Tests set NODE_ENV=test and skip the live check.
    if (this.nodeEnv === 'test') {
      return;
    }

    try {
      await this.query('SELECT 1');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const message = `PostgreSQL connection failed (${this.label}): ${detail}`;
      this.logger.error(message);
      throw new Error(message, { cause: error });
    }

    this.logger.log(`Connected to PostgreSQL (${this.label})`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  query<T extends QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T, unknown[]>(text, values);
  }
}
