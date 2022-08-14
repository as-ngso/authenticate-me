import { Knex } from 'knex';
import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { KNEX_CONNECTION } from '../knex/knex.module';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findById(id: number) {
    const [user] = await this.knex('users').select('*').where('id', '=', id);
    if (!user) return null;
    return user;
  }

  async findByToken(token: string, context: string = 'access') {
    const [user] = await this.knex
      .select('u.*')
      .from('users as u')
      .leftJoin('user_tokens as t', 'u.id', '=', 't.userId')
      .where('t.value', '=', token)
      .andWhere('t.context', '=', context);

    if (!user) return null;

    return user;
  }

  async update(id: number, input: UpdateUserDTO) {
    let newPassword: string;
    if (input.password) {
      newPassword = await hash(input.password);
    }

    const [user] = await this.knex('users')
      .update({
        ...input,
        password: newPassword,
      })
      .where('id', '=', id)
      .returning('*');

    return user;
  }

  async delete(id: number) {
    try {
      await this.knex('users').delete().where('id', '=', id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
