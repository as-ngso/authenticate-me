import { Knex } from 'knex';
import { Test } from '@nestjs/testing';
import { hash, verify } from 'argon2';
import { KnexModule, KNEX_CONNECTION } from '../../src/knex/knex.module';
import { UserService } from '../../src/user/user.service';
import knexConfig from '../../src/db/knexfile';
import {
  createFactoryAccessTokens,
  createFactoryUser,
} from '../factories/user.factory';

describe('UserService', () => {
  let userService: UserService;
  let knex: Knex;

  const factoryUser = createFactoryUser();
  const factoryTokens = createFactoryAccessTokens(factoryUser.id);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [KnexModule.forRoot(knexConfig.test)],
      providers: [UserService],
    }).compile();

    userService = module.get(UserService);
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

  describe('findById', () => {
    it('should find and return the user by id', async () => {
      const result = await userService.findById(factoryUser.id);

      expect(result).toMatchObject({
        id: factoryUser.id,
        email: factoryUser.email,
        firstName: factoryUser.firstName,
        lastName: factoryUser.lastName,
      });
    });

    it('should return null if no user was found', async () => {
      const result = await userService.findById(1234);

      expect(result).toBeNull();
    });
  });

  describe('findByToken', () => {
    it('should find and return the user by token', async () => {
      const result = await userService.findByToken(factoryTokens[0].value);

      expect(result).toMatchObject({
        id: factoryUser.id,
        email: factoryUser.email,
        firstName: factoryUser.firstName,
        lastName: factoryUser.lastName,
      });
    });

    it('should return null if no user was found', async () => {
      const result = await userService.findByToken('tokendoesnotexist');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update the user', async () => {
      const result = await userService.update(factoryUser.id, {
        email: 'new@email.com',
        password: 'newpassword',
      });

      const [userInDb] = await knex('users').select('*').where('id', '=', 1);

      const match = await verify(userInDb.password, 'newpassword');

      expect(match).toBe(true);
      expect(result).toEqual(userInDb);
    });
  });

  describe('delete', () => {
    it('should delete the user', async () => {
      const result = await userService.delete(factoryUser.id);

      expect(result).toBe(true);

      const [userInDb] = await knex('users').select('*').where('id', '=', 1);

      expect(userInDb).toBeUndefined();
    });
  });
});
