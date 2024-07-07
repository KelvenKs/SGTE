import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('viatura', (table) => {
        table.uuid('id').primary()
        table.text('matricula').notNullable()
        table.text('marca').notNullable()
        table.text('inspeccao').notNullable()
        table.text('seguro').notNullable() 
        table.text('foto').notNullable()
        table.integer('lotacao').defaultTo(17); // Adiciona a coluna 'lotacao' com o valor padrão de 17
        table.uuid('motorista_id').references('id').inTable('motoristas').onDelete('SET NULL')
         table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('viatura')
}
