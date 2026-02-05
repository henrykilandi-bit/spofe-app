import request from 'supertest';

describe('Stock API (READ ONLY)', () => {
  it('GET /api/stocks/depot/:id', async () => {
    await request(global.app.getHttpServer())
      .get('/api/stocks/depot/depot-1')
      .expect(200);
  });

  it('rejects POST (mutation forbidden)', async () => {
    await request(global.app.getHttpServer())
      .post('/api/stocks')
      .expect(404);
  });
});