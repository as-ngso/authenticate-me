import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_tokens', (t) => {
    t.increments('id', { primaryKey: true });
    t.string('value').notNullable().unique();
    t.string('context').notNullable();
    t.integer('userId').notNullable().unsigned().index();
    t.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

    t.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropSchemaIfExists('user_tokens');
}
