import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

export async function avaliacoesRoutes(app: FastifyInstance) {
    // GET listar avaliações
    app.get('/avaliacoes', async () => {
        const avaliacoes = await knex('avaliacoes')
            .join('motoristas', 'avaliacoes.motoristas_id', 'motoristas.id')
            .join('usuarios as u_motoristas', 'motoristas.usuario_id', 'u_motoristas.id')
            .join('estudantes', 'avaliacoes.estudante_id', 'estudantes.id')
            .join('usuarios as u_estudantes', 'estudantes.usuario_id', 'u_estudantes.id')
            .join('viatura_estudantes', 'estudantes.id', 'viatura_estudantes.estudante_id')
            .join('viatura', 'viatura_estudantes.viatura_id', 'viatura.id')
            .select(
                'avaliacoes.id',
                'avaliacoes.avaliacao',
                'avaliacoes.comentario',
                'u_estudantes.nome as estudante_nome',
                'u_motoristas.nome as motorista_nome'
            );

        return avaliacoes;
    });

    // POST criar avaliação
    app.post('/avaliacoes', async (request, reply) => {
        const createAvaliacaoBodySchema = z.object({
            estudante_id: z.string().uuid(),
            motorista_id: z.string().uuid(),
            avaliacao: z.number().min(1).max(5).nonnegative(),
            comentario: z.string().optional(),
        });

        const { estudante_id, motorista_id, avaliacao, comentario } = createAvaliacaoBodySchema.parse(request.body);

        // Verifica se o estudante está associado a alguma viatura
        const estudanteAssociado = await knex('viatura_estudantes')
            .where('estudante_id', estudante_id)
            .select('viatura_id')
            .first();

        if (!estudanteAssociado) {
            return reply.status(403).send({ message: 'O estudante não está associado a nenhuma viatura' });
        }

        try {
            await knex('avaliacoes').insert({
                id: knex.raw('UUID()'),
                estudante_id,
                motoristas_id: motorista_id,
                avaliacao,
                comentario,
                created_at: knex.raw('CURRENT_TIMESTAMP()'),
                updated_at: knex.raw('CURRENT_TIMESTAMP()'),
            });

            return reply.status(201).send({ message: 'Avaliação registrada com sucesso' });
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            return reply.status(500).send({ message: 'Erro ao criar avaliação' });
        }
    });

    // DELETE avaliação por ID
    app.delete('/avaliacoes/:id', async (request, reply) => {
        const deleteAvaliacaoParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = deleteAvaliacaoParamsSchema.parse(request.params);

        try {
            const deleted = await knex('avaliacoes').where('id', id).delete();

            if (deleted === 0) {
                return reply.status(404).send({ message: 'Avaliação não encontrada' });
            }

            return reply.send({ message: 'Avaliação deletada com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar avaliação:', error);
            return reply.status(500).send({ message: 'Erro ao deletar avaliação' });
        }
    });
}
