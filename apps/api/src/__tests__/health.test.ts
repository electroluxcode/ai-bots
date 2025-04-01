import request from 'supertest';
import app from '../index';

describe('Health Endpoint', () => {
  it('should return 200 and success message', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('API is running');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });
}); 