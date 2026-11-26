import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('applies defaults when database credentials are present', () => {
    expect(
      validateEnv({
        PGUSER: 'postgres',
        PGPASSWORD: 'postgres',
        PGDATABASE: 'losrecibos',
      }),
    ).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      API_PREFIX: 'api',
      CORS_ORIGINS: '',
      DATABASE_URL: '',
      PGHOST: 'localhost',
      PGPORT: 5432,
      PGUSER: 'postgres',
      PGPASSWORD: 'postgres',
      PGDATABASE: 'losrecibos',
      PGSSLMODE: 'disable',
    });
  });

  it('coerces a valid environment', () => {
    expect(
      validateEnv({
        NODE_ENV: 'production',
        PORT: '8080',
        API_PREFIX: ' api ',
        CORS_ORIGINS: ' http://localhost:5173 ',
        PGHOST: ' localhost ',
        PGPORT: '5433',
        PGUSER: ' postgres ',
        PGPASSWORD: ' secret ',
        PGDATABASE: ' losrecibos ',
        PGSSLMODE: ' REQUIRE ',
      }),
    ).toMatchObject({
      NODE_ENV: 'production',
      PORT: 8080,
      API_PREFIX: 'api',
      CORS_ORIGINS: 'http://localhost:5173',
      PGHOST: 'localhost',
      PGPORT: 5433,
      PGUSER: 'postgres',
      PGPASSWORD: 'secret',
      PGDATABASE: 'losrecibos',
      PGSSLMODE: 'require',
    });
  });

  it('requires database credentials when DATABASE_URL is absent', () => {
    expect(() => validateEnv({})).toThrow(/PGUSER, PGPASSWORD, PGDATABASE/);
  });

  it('accepts DATABASE_URL without discrete credentials', () => {
    expect(
      validateEnv({
        DATABASE_URL:
          ' postgresql://postgres:postgres@localhost:5432/losrecibos ',
      }),
    ).toMatchObject({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/losrecibos',
    });
  });

  it('allows an empty password when PGPASSWORD is set', () => {
    expect(
      validateEnv({
        PGUSER: 'postgres',
        PGPASSWORD: '',
        PGDATABASE: 'losrecibos',
      }).PGPASSWORD,
    ).toBe('');
  });

  it('rejects a DATABASE_URL that is not postgresql', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'mysql://localhost/losrecibos' }),
    ).toThrow(/postgresql/);
  });

  it('rejects a malformed DATABASE_URL', () => {
    expect(() => validateEnv({ DATABASE_URL: 'not a url' })).toThrow(
      /valid URL/,
    );
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects a port outside 1-65535', () => {
    expect(() => validateEnv({ PORT: '0' })).toThrow(
      /Invalid environment configuration/,
    );
    expect(() => validateEnv({ PORT: '70000' })).toThrow(
      /Invalid environment configuration/,
    );
    expect(() =>
      validateEnv({
        PGPORT: '0',
        PGUSER: 'postgres',
        PGPASSWORD: 'postgres',
        PGDATABASE: 'losrecibos',
      }),
    ).toThrow(/Invalid environment configuration/);
  });

  it('rejects an unknown PGSSLMODE', () => {
    expect(() =>
      validateEnv({
        PGSSLMODE: 'allow',
        PGUSER: 'postgres',
        PGPASSWORD: 'postgres',
        PGDATABASE: 'losrecibos',
      }),
    ).toThrow(/Invalid environment configuration/);
  });

  it('rejects a prefix that would produce a broken path', () => {
    expect(() => validateEnv({ API_PREFIX: '/api' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects a CORS list that mixes a wildcard with explicit origins', () => {
    expect(() =>
      validateEnv({ CORS_ORIGINS: '*,http://localhost:5173' }),
    ).toThrow(/cannot mix/);
  });
});
