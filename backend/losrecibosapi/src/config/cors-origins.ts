export function parseCorsOrigins(value: string): true | string[] | false {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    return false;
  }

  if (origins.includes('*') && origins.length > 1) {
    throw new Error('CORS_ORIGINS cannot mix "*" with explicit origins');
  }

  if (origins.length === 1 && origins[0] === '*') {
    return true;
  }

  return origins;
}
