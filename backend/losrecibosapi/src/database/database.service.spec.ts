import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Pool } from 'pg';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { DatabaseService } from './database.service.js';

function configFor(nodeEnv: EnvironmentVariables['NODE_ENV']) {
  const values: Record<string, string | number> = {
    NODE_ENV: nodeEnv,
    DATABASE_URL: '',
    PGHOST: 'localhost',
    PGPORT: 5432,
    PGUSER: 'postgres',
    PGPASSWORD: 'secret',
    PGDATABASE: 'losrecibos',
    PGSSLMODE: 'disable',
  };

  return {
    get: (key: string) => values[key],
  } as ConfigService<EnvironmentVariables, true>;
}

function fakePool() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  };
}

describe('DatabaseService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checks the connection outside test', async () => {
    const pool = fakePool();
    const service = new DatabaseService(
      pool as unknown as Pool,
      configFor('development'),
    );

    await service.onModuleInit();

    expect(pool.query).toHaveBeenCalledWith('SELECT 1', undefined);
    await service.onModuleDestroy();
    expect(pool.end).toHaveBeenCalledOnce();
  });

  it('skips the connection check when NODE_ENV is test', async () => {
    const pool = fakePool();
    const service = new DatabaseService(
      pool as unknown as Pool,
      configFor('test'),
    );

    await service.onModuleInit();

    expect(pool.query).not.toHaveBeenCalled();
  });

  it('runs parameterized queries through the pool', async () => {
    const pool = fakePool();
    const service = new DatabaseService(
      pool as unknown as Pool,
      configFor('test'),
    );

    await service.query('select $1::text as name', ['ok']);

    expect(pool.query).toHaveBeenCalledWith('select $1::text as name', ['ok']);
  });

  it('reports a failed connection with the target and the driver message', async () => {
    const pool = fakePool();
    pool.query.mockRejectedValueOnce(
      new Error('password authentication failed'),
    );
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const service = new DatabaseService(
      pool as unknown as Pool,
      configFor('production'),
    );

    await expect(service.onModuleInit()).rejects.toThrow(
      'PostgreSQL connection failed (postgres@localhost:5432/losrecibos): password authentication failed',
    );
  });
});
