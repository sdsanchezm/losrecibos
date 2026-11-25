import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('applies defaults when the environment is empty', () => {
    expect(validateEnv({})).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      API_PREFIX: 'api',
      CORS_ORIGINS: '',
    });
  });

  it('coerces a valid environment', () => {
    expect(
      validateEnv({
        NODE_ENV: 'production',
        PORT: '8080',
        API_PREFIX: ' api ',
        CORS_ORIGINS: ' http://localhost:5173 ',
      }),
    ).toMatchObject({
      NODE_ENV: 'production',
      PORT: 8080,
      API_PREFIX: 'api',
      CORS_ORIGINS: 'http://localhost:5173',
    });
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
