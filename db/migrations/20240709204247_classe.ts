import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('classe', (table) => {
        table.uuid('id').primary()
        table.string('nome').notNullable()
        table.timestamps(true, true)
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('classe')
}
