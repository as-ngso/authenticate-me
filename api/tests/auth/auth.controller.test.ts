import { INestApplication } from '@nestjs/common';
import { hash } from 'argon2';
import { Knex } from 'knex';
import * as request from 'supertest';
import { create } from '../../src/app';
import { KNEX_CONNECTION } from '../../src/knex/knex.module';
import {
  createFactoryAccessTokens,
  createFactoryUser,
} from '../factories/user.factory';

describe('AuthController', () => {
  let app: INestApplication;
  let knex: Knex;

  const factoryUser = createFactoryUser();
  const factoryTokens = createFactoryAccessTokens(factoryUser.id, 10);

  beforeAll(async () => {
    app = await create({ logger: false });
    knex = app.get(KNEX_CONNECTION);

    await knex('users').insert({
      ...factoryUser,
      password: await hash(factoryUser.password),
    });

    await knex('user_tokens').insert(factoryTokens);

    await app.init();
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should create new user and return 201 status code', async () => {
      const { id, ...registerData } = createFactoryUser();

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerData);

      expect(response.statusCode).toBe(201);

      expect(response.body.user).toMatchObject({
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken.context).toBe('access');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return the logged in user and the access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: factoryUser.email,
          password: factoryUser.password,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body.user).toMatchObject({
        id: factoryUser.id,
        email: factoryUser.email,
        firstName: factoryUser.firstName,
        lastName: factoryUser.lastName,
      });

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken.context).toBe('access');
    });
  });

  describe('DELETE /api/auth/logout', () => {
    it('should log the user out', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/auth/logout')
        .set('authorization', factoryTokens[0].value);

      expect(response.body).toEqual({ success: true });
    });

    it('should log the user out from all devices', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/auth/logout?all=true')
        .set('authorization', factoryTokens[1].value);

      expect(response.body).toEqual({ success: true });
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/api/auth/logout',
      );

      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      });
    });
  });
});
