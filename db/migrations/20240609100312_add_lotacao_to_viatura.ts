// migration para adicionar a coluna 'lotacao'
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('viatura', (table) => {
        table.integer('lotacao').defaultTo(17); // Adiciona a coluna 'lotacao' com o valor padrão de 17
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('viatura', (table) => {
        table.dropColumn('lotacao');
    });
}
