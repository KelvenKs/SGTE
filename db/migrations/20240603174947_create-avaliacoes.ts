import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('avaliacoes', (table) => {
        table.uuid('id').primary()
        table.uuid('estudantes_id').references('id').inTable('estudantes').onDelete('CASCADE')
        table.uuid('motoristas_id').references('id').inTable('motoristas').onDelete('CASCADE')
        table.integer('avaliacao').notNullable()
        table.text('comentario')
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('avaliacoes')
}
