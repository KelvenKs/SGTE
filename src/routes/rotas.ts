import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function rotasRoutes(app: FastifyInstance) {
    // GET listar rotas
    app.get('/rota', async () => {
        const rotas = await knex('rotas').select()
        return rotas
    })

    // POST criar rota
    app.post('/rota', async (request, reply) => {
        const createRotaBodySchema = z.object({
            hora_chegada: z.string(),
            hora_partida: z.string(),
            descricao: z.string(),
            viatura_id: z.string().uuid().optional(),
        })

        const { hora_chegada, hora_partida, descricao, viatura_id } = createRotaBodySchema.parse(request.body)

        await knex('rotas').insert({
            id: randomUUID(),
            hora_chegada,
            hora_partida,
            descricao,
            viatura_id,
        })

        return reply.status(201).send()
    })

    // PUT atualizar rota por ID
    app.put('/rota/:id', async (request, reply) => {
        const getRotaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateRotaBodySchema = z.object({
            hora_chegada: z.string().optional(),
            hora_partida: z.string().optional(),
            descricao: z.string().optional(),
            viatura_id: z.string().uuid().optional(),
        })

        const { id } = getRotaParamsSchema.parse(request.params)
        const data = updateRotaBodySchema.parse(request.body)

        const updated = await knex('rotas').where('id', id).update(data)

        if (updated === 0) {
            return reply.status(404).send({ message: 'Rota não encontrada' })
        }

        return reply.send({ message: 'Rota atualizada com sucesso' })
    })

    // DELETE rota por ID
    app.delete('/rota/:id', async (request, reply) => {
        const getRotaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getRotaParamsSchema.parse(request.params)

        const deleted = await knex('rotas').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Rota não encontrada' })
        }

        return reply.send({ message: 'Rota deletada com sucesso' })
    })
}
