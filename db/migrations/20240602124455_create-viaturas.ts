import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('viatura', (table) => {
        table.uuid('id').primary()
        table.text('matricula').notNullable()
        table.text('marca').notNullable()
        table.text('inspeccao').notNullable()
        table.text('seguro').notNullable() 
        table.text('foto').notNullable()

         table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('viatura')
}
