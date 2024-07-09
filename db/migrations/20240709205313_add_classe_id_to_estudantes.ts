import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('estudantes', (table) => {
        table.uuid('classe_id').references('id').inTable('classe').onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('estudantes', (table) => {
        table.dropColumn('classe_id');
    });
}
