import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const controller = new HealthController();

  it('reports the process as ok', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBe(new Date(result.timestamp).toISOString());
  });
});
