import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { API_DEFAULT_VERSION, configureApp } from '../src/app.setup.js';
import { AppModule } from '../src/app.module.js';
import { EnvironmentVariables } from '../src/config/env.validation.js';

describe('Health (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    await configureApp(app);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok', async () => {
    const config = app.get(ConfigService<EnvironmentVariables, true>);
    const prefix = config.get('API_PREFIX', { infer: true });

    const response = await request(app.getHttpServer())
      .get(`/${prefix}/v${API_DEFAULT_VERSION}/health`)
      .expect(200);

    expect(response.body).toMatchObject({ status: 'ok' });
    expect(response.body.timestamp).toEqual(expect.any(String));
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('GET / returns a JSON 404', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: 'Cannot GET /',
      path: '/',
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('GET /api/v1/missing returns a JSON 404', async () => {
    const config = app.get(ConfigService<EnvironmentVariables, true>);
    const prefix = config.get('API_PREFIX', { infer: true });
    const path = `/${prefix}/v${API_DEFAULT_VERSION}/missing`;

    const response = await request(app.getHttpServer()).get(path).expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      message: `Cannot GET ${path}`,
      path,
    });
  });
});
