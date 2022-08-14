import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (t) => {
    t.increments('id', { primaryKey: true });
    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
    t.string('email').notNullable().unique();
    t.string('password').notNullable();

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
