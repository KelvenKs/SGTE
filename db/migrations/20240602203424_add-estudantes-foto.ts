import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('estudantes', (table) => {
        table.text('foto') // Remova .notNullable() se permitir valores nulos
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('estudantes', (table) => {
        table.dropColumn('foto')
    })
}
