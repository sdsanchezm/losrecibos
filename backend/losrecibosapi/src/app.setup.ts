import { HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import {
  AllExceptionsFilter,
  httpErrorBody,
} from './common/filters/all-exceptions.filter.js';
import { parseCorsOrigins } from './config/cors-origins.js';
import { EnvironmentVariables } from './config/env.validation.js';

export const API_DEFAULT_VERSION = '1';

export async function configureApp(app: NestExpressApplication): Promise<void> {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.disable('x-powered-by');
  app.setGlobalPrefix(config.get('API_PREFIX', { infer: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });
  app.enableShutdownHooks();

  const corsOrigins = parseCorsOrigins(
    config.get('CORS_ORIGINS', { infer: true }),
  );
  if (Array.isArray(corsOrigins)) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  } else if (corsOrigins === true) {
    app.enableCors({ origin: '*' });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Routes are registered during init. The fallback has to come after them so
  // paths outside the global prefix get the same JSON 404 as missing API routes.
  await app.init();
  app.use((req: Request, res: Response) => {
    const path = req.originalUrl || req.url;
    res
      .status(HttpStatus.NOT_FOUND)
      .json(
        httpErrorBody(
          HttpStatus.NOT_FOUND,
          `Cannot ${req.method} ${path}`,
          path,
        ),
      );
  });
}
