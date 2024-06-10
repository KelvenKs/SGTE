import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('motorista_estudantes', (table) => {
        table.uuid('id').primary()
        table.uuid('motorista_id').references('id').inTable('motoristas').onDelete('CASCADE')
        table.uuid('estudante_id').references('id').inTable('estudantes').onDelete('CASCADE')
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('motorista_estudantes')
}
