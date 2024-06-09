import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('relatorios', (table) => {
        table.uuid('id').primary()
        table.text('tipo').notNullable()
        table.text('dados').notNullable()
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('relatorios')
}
