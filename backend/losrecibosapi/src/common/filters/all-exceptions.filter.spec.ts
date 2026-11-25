import {
  ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  let errorLog: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorLog = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes through an HTTP exception message', () => {
    const { host, status, json } = createHost();

    filter.catch(new NotFoundException('missing'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'missing',
        path: '/api/v1/missing',
      }),
    );
  });

  it('preserves validation messages', () => {
    const { host, json } = createHost();

    filter.catch(new BadRequestException(['name must be a string']), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['name must be a string'],
      }),
    );
  });

  it('hides unexpected error details from the client', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('database password is wrong'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0]?.[0] as { message: string };
    expect(body.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('database password');
    expect(errorLog).toHaveBeenCalled();
  });
});

function createHost(url = '/api/v1/missing'): {
  host: ArgumentsHost;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'GET', url, originalUrl: url }),
    }),
  } as ArgumentsHost;

  return { host, status, json };
}
