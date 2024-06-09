import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('motorista_rotas', (table) => { // Correção do nome da tabela
        table.uuid('id').primary()
        table.uuid('motorista_id').references('id').inTable('motoristas').onDelete('CASCADE')
        table.uuid('rota_id').references('id').inTable('rotas').onDelete('CASCADE') // Correção do nome da tabela
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('motorista_rotas') // Correção do nome da tabela
}
