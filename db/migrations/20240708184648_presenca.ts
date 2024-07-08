import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('presencas', (table) => {
        table.uuid('id').primary();
        table.uuid('estudante_id').references('id').inTable('estudantes').onDelete('CASCADE');
        table.uuid('viatura_id').references('id').inTable('viatura').onDelete('CASCADE');
        table.date('data').notNullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('presencas');
}
