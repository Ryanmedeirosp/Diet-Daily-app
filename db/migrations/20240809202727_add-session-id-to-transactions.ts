import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').references('user.id').notNullable()
    table.string('title').notNullable()
    table.string('description').notNullable()
    table.boolean('on_diet').notNullable()
    table.date('date').notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
