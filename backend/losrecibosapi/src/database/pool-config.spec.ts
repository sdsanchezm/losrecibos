import {
  createPoolConfig,
  databaseLabel,
  type DatabaseEnv,
} from './pool-config.js';

const discrete: DatabaseEnv = {
  DATABASE_URL: '',
  PGHOST: 'localhost',
  PGPORT: 5432,
  PGUSER: 'postgres',
  PGPASSWORD: 'secret',
  PGDATABASE: 'losrecibos',
  PGSSLMODE: 'disable',
};

describe('createPoolConfig', () => {
  it('uses discrete credentials', () => {
    expect(createPoolConfig(discrete)).toMatchObject({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'secret',
      database: 'losrecibos',
      application_name: 'losrecibosapi',
      ssl: false,
    });
    expect(createPoolConfig(discrete).connectionString).toBeUndefined();
  });

  it('uses DATABASE_URL in place of the discrete settings', () => {
    const config = createPoolConfig({
      ...discrete,
      DATABASE_URL: 'postgresql://app:secret@db.internal:5432/losrecibos',
      PGSSLMODE: 'require',
    });

    expect(config.connectionString).toBe(
      'postgresql://app:secret@db.internal:5432/losrecibos',
    );
    expect(config.host).toBeUndefined();
    expect(config.user).toBeUndefined();
    expect(config.ssl).toEqual({ rejectUnauthorized: false });
  });

  it('maps PGSSLMODE onto the pool ssl option', () => {
    expect(
      createPoolConfig({ ...discrete, PGSSLMODE: 'verify-full' }).ssl,
    ).toEqual({ rejectUnauthorized: true });

    expect(
      createPoolConfig({ ...discrete, PGSSLMODE: 'verify-ca' }).ssl,
    ).toEqual(
      expect.objectContaining({
        rejectUnauthorized: true,
        checkServerIdentity: expect.any(Function),
      }),
    );
  });
});

describe('databaseLabel', () => {
  it('describes discrete settings', () => {
    expect(databaseLabel(discrete)).toBe('postgres@localhost:5432/losrecibos');
  });

  it('describes a connection URL without its password', () => {
    const label = databaseLabel({
      ...discrete,
      DATABASE_URL: 'postgresql://app:secret@db.internal:5432/losrecibos',
    });

    expect(label).toBe('app@db.internal:5432/losrecibos');
    expect(label).not.toContain('secret');
  });
});
