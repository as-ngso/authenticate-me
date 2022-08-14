import { Knex } from 'knex';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { UtilService } from '../util/util.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly utilService: UtilService,
  ) {}

  async register(input: RegisterDTO) {
    const [existingUser] = await this.knex('users')
      .select('*')
      .where('email', '=', input.email);

    if (existingUser) {
      throw new ConflictException('email not available');
    }

    const hashedPassword = await hash(input.password);

    const result = await this.knex.transaction(async (trx) => {
      try {
        const [user] = await trx('users')
          .insert({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            password: hashedPassword,
          })
          .returning(['id', 'firstName', 'lastName', 'email']);

        const tokenValue = await this.utilService.generateRandomToken();

        const [token] = await trx('user_tokens')
          .insert({
            value: tokenValue,
            context: 'access',
            userId: user.id,
          })
          .returning(['value', 'context']);

        await trx.commit([user, token]);
      } catch (error) {
        await trx.rollback();
      }
    });

    return {
      user: result[0],
      accessToken: result[1],
    };
  }

  async login(input: LoginDTO) {
    const [user] = await this.knex('users')
      .select(['id', 'firstName', 'lastName', 'email', 'password'])
      .where('email', '=', input.email);

    if (!user) {
      throw new BadRequestException('invalid credentials');
    }

    const match = await verify(user.password, input.password);

    if (!match) {
      throw new BadRequestException('invalid credentials');
    }

    const tokenValue = await this.utilService.generateRandomToken();

    const [token] = await this.knex('user_tokens')
      .insert({
        value: tokenValue,
        context: 'access',
        userId: user.id,
      })
      .returning(['value', 'context']);

    const { password, ...returningUser } = user;

    return { user: returningUser, accessToken: token };
  }

  async logout(token: string) {
    try {
      await this.knex('user_tokens').delete().where('value', '=', token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async logoutFromAllDevices(token: string) {
    try {
      const subquery = this.knex('user_tokens')
        .select('userId')
        .where('value', '=', token);

      await this.knex('user_tokens').delete().where('userId', '=', subquery);

      return true;
    } catch (error) {
      return false;
    }
  }
}
