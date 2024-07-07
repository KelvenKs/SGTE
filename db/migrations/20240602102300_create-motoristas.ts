import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('motoristas', (table) => {
        table.uuid('id').primary()
        table.uuid('usuario_id').references('id').inTable('usuarios').onDelete('CASCADE')
        table.text('licenca').notNullable()
        table.text('registo_criminal').notNullable()
        table.text('foto').notNullable()
        table.string('contacto', 9)  // Adicionando o campo 'contacto'
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('motoristas');
}
