import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Smoke test e2e: requiere la base de datos levantada (docker compose up -d).
// Verifica que el módulo bootea y que los guards protegen los endpoints.
describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rechaza con 401 un endpoint protegido sin token', () => {
    return request(app.getHttpServer()).get('/users').expect(401);
  });

  it('rechaza con 401 un endpoint protegido con cookie inválida', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Cookie', 'access_token=token-invalido')
      .expect(401);
  });

  it('responde 404 en una ruta inexistente', () => {
    return request(app.getHttpServer()).get('/ruta-que-no-existe').expect(404);
  });
});
