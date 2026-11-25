import { parseCorsOrigins } from './cors-origins.js';

describe('parseCorsOrigins', () => {
  it('disables CORS when no origins are configured', () => {
    expect(parseCorsOrigins('')).toBe(false);
    expect(parseCorsOrigins(' , ')).toBe(false);
  });

  it('allows any origin when the value is a wildcard', () => {
    expect(parseCorsOrigins('*')).toBe(true);
  });

  it('returns a trimmed origin list', () => {
    expect(
      parseCorsOrigins(' http://localhost:5173, http://localhost:3000 '),
    ).toEqual(['http://localhost:5173', 'http://localhost:3000']);
  });

  it('rejects a wildcard mixed with explicit origins', () => {
    expect(() => parseCorsOrigins('*,http://localhost:5173')).toThrow(
      /cannot mix/,
    );
  });
});
