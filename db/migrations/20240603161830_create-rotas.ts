import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('rotas', (table) => {
        table.uuid('id').primary()
        table.time('hora_chegada').notNullable()
        table.time('hora_partida').notNullable()
        table.text('descricao').notNullable()
        table.uuid('viatura_id').references('id').inTable('viatura').onDelete('SET NULL')
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('rotas')
}
