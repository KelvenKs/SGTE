import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('estudantes', (table) => {
        table.uuid('id').primary()
        table.uuid('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE');
        table.integer('idade').notNullable()
        table.text('contacto_responsavel').notNullable()
        table.text('classe').notNullable()
        table.text('turma').notNullable()
        table.text('foto') // Remova .notNullable() se permitir valores nulos
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('estudantes')
}
