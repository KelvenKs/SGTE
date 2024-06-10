import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function motoristaRotasRoutes(app: FastifyInstance) {
    // GET listar rotas de motoristas
    app.get('/motorista_rota', async () => { // Correção do nome da rota
        const motoristaRotas = await knex('motorista_rotas').select() // Correção do nome da tabela
        return motoristaRotas
    })

    // POST criar rota de motorista
    app.post('/motorista_rota', async (request, reply) => { // Correção do nome da rota
        const createMotoristaRotaBodySchema = z.object({
            motorista_id: z.string().uuid(),
            rota_id: z.string().uuid(),
        })

        const { motorista_id, rota_id } = createMotoristaRotaBodySchema.parse(request.body);

        await knex('motorista_rotas').insert({ // Correção do nome da tabela
            id: randomUUID(),
            motorista_id,
            rota_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        return reply.status(201).send()
    })

    // PUT atualizar rota de motorista por ID
    app.put('/motorista_rota/:id', async (request, reply) => { // Correção do nome da rota
        const getMotoristaRotaParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const updateMotoristaRotaBodySchema = z.object({
            motorista_id: z.string().uuid().optional(),
            rota_id: z.string().uuid().optional(),
        });

        const { id } = getMotoristaRotaParamsSchema.parse(request.params)
        const data = updateMotoristaRotaBodySchema.parse(request.body)

        const updated = await knex('motorista_rotas').where('id', id).update({ // Correção do nome da tabela
            ...data,
            updated_at: new Date().toISOString(),
        })

        if (updated === 0) {
            return reply.status(404).send({ message: 'Rota de motorista não encontrada' })
        }

        return reply.send({ message: 'Rota de motorista atualizada com sucesso' })
    })

    // DELETE rota de motorista por ID
    app.delete('/motorista_rota/:id', async (request, reply) => { // Correção do nome da rota
        const getMotoristaRotaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getMotoristaRotaParamsSchema.parse(request.params)

        const deleted = await knex('motorista_rotas').where('id', id).delete() // Correção do nome da tabela

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Rota de motorista não encontrada' })
        }

        return reply.send({ message: 'Rota de motorista deletada com sucesso' })
    })
}
