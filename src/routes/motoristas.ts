import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'


export async function motoristasRoutes(app: FastifyInstance) {
    // GET listar motoristas
    app.get('/motorista', async () => {
        const motoristas = await knex('motoristas').select()
        return motoristas
    })

    // POST criar motorista
    app.post('/motorista', async (request, reply) => {
        const createMotoristaBodySchema = z.object({
            usuario_id: z.string().uuid(),
            licenca: z.string(),
            registo_criminal: z.string(),
            foto: z.string(),
            viatura_id: z.string().uuid().optional(),
        })

        const { usuario_id, licenca, registo_criminal, foto, viatura_id } = createMotoristaBodySchema.parse(request.body)

        await knex('motoristas').insert({
            id: randomUUID(),
            usuario_id,
            licenca,
            registo_criminal,
            foto,
            viatura_id: viatura_id || null,
        })

        return reply.status(201).send()
    })

    // PUT atualizar motorista por ID
    app.put('/motorista/:id', async (request, reply) => {
        const getMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateMotoristaBodySchema = z.object({
            usuario_id: z.string().uuid().optional(),
            licenca: z.string().optional(),
            registo_criminal: z.string().optional(),
            foto: z.string().optional(),
            viatura_id: z.string().uuid().optional(),
        })

        const { id } = getMotoristaParamsSchema.parse(request.params)
        const data = updateMotoristaBodySchema.parse(request.body)

        const updated = await knex('motoristas').where('id', id).update(data)

        if (updated === 0) {
            return reply.status(404).send({ message: 'Motorista não encontrado' })
        }

        return reply.send({ message: 'Motorista atualizado com sucesso' })
    })

    // DELETE motorista por ID
    app.delete('/motorista/:id', async (request, reply) => {
        const getMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getMotoristaParamsSchema.parse(request.params)

        const deleted = await knex('motoristas').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Motorista não encontrado' })
        }

        return reply.send({ message: 'Motorista deletado com sucesso' })
    })
}
