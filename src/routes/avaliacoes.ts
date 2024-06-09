import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function avaliacoesRoutes(app: FastifyInstance) {
    // GET listar avaliações
    app.get('/avaliacoes', async () => {
        const avaliacoes = await knex('avaliacoes').select()
        return avaliacoes
    })

    // POST criar avaliação
    app.post('/avaliacoes', async (request, reply) => {
        const createAvaliacaoBodySchema = z.object({
            estudante_id: z.string().uuid(),
            motorista_id: z.string().uuid(),
            avaliacao: z.number().min(1).max(5).nonnegative(),
            comentario: z.string().optional(),
        })

        const { estudante_id, motorista_id, avaliacao, comentario } = createAvaliacaoBodySchema.parse(request.body)

        await knex('avaliacoes').insert({
            id: randomUUID(),
            estudante_id,
            motorista_id,
            avaliacao,
            comentario,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        return reply.status(201).send();
    })

    // PUT atualizar avaliação por ID
    app.put('/avaliacoes/:id', async (request, reply) => {
        const getAvaliacaoParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateAvaliacaoBodySchema = z.object({
            estudante_id: z.string().uuid().optional(),
            motorista_id: z.string().uuid().optional(),
            avaliacao: z.number().min(1).max(5).nonnegative().optional(),
            comentario: z.string().optional(),
        })

        const { id } = getAvaliacaoParamsSchema.parse(request.params)
        const data = updateAvaliacaoBodySchema.parse(request.body)

        const updated = await knex('avaliacoes').where('id', id).update({
            ...data,
            updated_at: new Date().toISOString(),
        })

        if (updated === 0) {
            return reply.status(404).send({ message: 'Avaliação não encontrada' })
        }

        return reply.send({ message: 'Avaliação atualizada com sucesso' })
    })

    // DELETE avaliação por ID
    app.delete('/avaliacoes/:id', async (request, reply) => {
        const getAvaliacaoParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getAvaliacaoParamsSchema.parse(request.params)

        const deleted = await knex('avaliacoes').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Avaliação não encontrada' })
        }

        return reply.send({ message: 'Avaliação deletada com sucesso' })
    })
}
