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

describe('UserResolver', () => {
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

  describe('GET /api/user/current', () => {
    it('should return the current user based on the access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/current')
        .set('authorization', factoryTokens[0].value);

      expect(response.body).toMatchObject({
        currentUser: {
          id: factoryUser.id,
          email: factoryUser.email,
          firstName: factoryUser.firstName,
          lastName: factoryUser.lastName,
        },
      });
    });

    it("should return null if there's no user found", async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/user/current',
      );

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      });
    });
  });

  describe('PATCH /api/user/update', () => {
    const user = createFactoryUser();
    const tokens = createFactoryAccessTokens(user.id, 10);

    beforeEach(async () => {
      await knex('users').insert({
        ...user,
        password: await hash(user.password),
      });

      await knex('user_tokens').insert(tokens);
    });

    afterEach(async () => {
      await knex('users').delete().where('id', '=', user.id);
    });

    it('should update the user information', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/user/update')
        .send({
          password: user.password,
          data: {
            email: 'test@email.com',
            password: 'newpassword',
          },
        })
        .set('authorization', tokens[0].value);

      expect(response.statusCode).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should check if the password is correct', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/user/update')
        .send({
          password: 'wrongpassword',
          data: {
            email: 'test@email.com',
            password: 'newpassword',
          },
        })
        .set('authorization', tokens[0].value);

      expect(response.statusCode).toBe(400);
      expect(response.body.user).not.toBeDefined();
    });

    it('should apply guard', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/user/update')
        .send({
          password: user.password,
          data: {
            email: 'test@email.com',
            password: 'newpassword',
          },
        });

      expect(response.statusCode).toBe(403);
      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      });
    });
  });
});
