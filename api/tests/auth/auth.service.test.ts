import { Knex } from 'knex';
import { Test } from '@nestjs/testing';
import { hash } from 'argon2';
import { KnexModule, KNEX_CONNECTION } from '../../src/knex/knex.module';
import knexConfig from '../../src/db/knexfile';
import {
  createFactoryAccessTokens,
  createFactoryUser,
} from '../factories/user.factory';
import { UtilService } from '../../src/util/util.service';
import { AuthService } from '../../src/auth/auth.service';
import { UserService } from '../../src/user/user.service';

describe('AuthService', () => {
  let authService: AuthService;
  let knex: Knex;

  const factoryUser = createFactoryUser();
  const factoryTokens = createFactoryAccessTokens(factoryUser.id, 10);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [AuthService, UtilService, UserService],
    }).compile();

    authService = module.get(AuthService);
    knex = module.get(KNEX_CONNECTION);

    await knex('users').insert({
      ...factoryUser,
      password: await hash(factoryUser.password),
    });

    await knex('user_tokens').insert(factoryTokens);
  });

  afterAll(async () => {
    await knex('users').delete();
    await knex.destroy();
  });

  describe('register', () => {
    it('should create the user and token in the database', async () => {
      const { id, ...registerData } = createFactoryUser();
      const result = await authService.register(registerData);

      expect(result.user).toMatchObject({
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });
      expect(result.accessToken).toBeDefined();

      const [accessTokenInDb] = await knex('user_tokens')
        .select('userId')
        .where('value', '=', result.accessToken.value)
        .andWhere('context', '=', result.accessToken.context);

      expect(accessTokenInDb).toBeDefined();
      expect(accessTokenInDb.userId).toBe(result.user.id);

      const [userInDb] = await knex('users')
        .select('password')
        .where('id', '=', result.user.id);

      expect(userInDb).toBeDefined();
      expect(userInDb.password).not.toBe(registerData.password);
    });

    it('should check if the email is available', async () => {
      await expect(authService.register(factoryUser)).rejects.toThrow(
        'email not available',
      );
    });
  });

  describe('login', () => {
    it('should create a new access for the user', async () => {
      const result = await authService.login({
        email: factoryUser.email,
        password: factoryUser.password,
      });

      expect(result.user).toMatchObject({
        id: factoryUser.id,
        email: factoryUser.email,
        firstName: factoryUser.firstName,
        lastName: factoryUser.lastName,
      });
      expect(result.accessToken).toBeDefined();

      const [accessTokenInDb] = await knex('user_tokens')
        .select('userId')
        .where('value', '=', result.accessToken.value)
        .andWhere('context', '=', result.accessToken.context);

      expect(accessTokenInDb).toBeDefined();
      expect(accessTokenInDb.userId).toBe(result.user.id);
    });

    it('should check if the credentials is valid', async () => {
      await expect(
        authService.login({
          email: 'not@email.com',
          password: factoryUser.password,
        }),
      ).rejects.toThrow('invalid credentials');

      await expect(
        authService.login({
          email: factoryUser.email,
          password: 'wrongwrongwrong',
        }),
      ).rejects.toThrow('invalid credentials');
    });
  });

  describe('logout', () => {
    it('should delete the token from the database', async () => {
      const result = await authService.logout(factoryTokens[0].value);
      expect(result).toBe(true);

      const [tokenInDb] = await knex('user_tokens')
        .select('*')
        .where('value', '=', factoryTokens[0].value)
        .andWhere('context', '=', factoryTokens[0].context);

      expect(tokenInDb).not.toBeDefined();
    });
  });

  describe('logoutFromAllDevices', () => {
    it('should delete all tokens for that user from the database', async () => {
      const result = await authService.logoutFromAllDevices(
        factoryTokens[1].value,
      );
      expect(result).toBe(true);

      const allUserTokens = await knex('user_tokens')
        .select('*')
        .where('userId', '=', factoryUser.id);

      expect(allUserTokens).toEqual([]);
    });
  });
});
