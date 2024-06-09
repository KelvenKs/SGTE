// migration para adicionar a coluna 'viatura_id' na tabela 'motorista_estudantes'
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('motorista_estudantes', (table) => {
        table.uuid('viatura_id').notNullable(); // Adiciona a coluna 'viatura_id'
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('motorista_estudantes', (table) => {
        table.dropColumn('viatura_id');
    });
}
