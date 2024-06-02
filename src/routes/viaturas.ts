import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function viaturasRoutes(app: FastifyInstance) {
    // GET listar viaturas
    app.get('/viatura', async () => {
        const viaturas = await knex('viatura').select()
        return viaturas
    })

    // POST criar viatura
    app.post('/viatura', async (request, reply) => {
        const createViaturaBodySchema = z.object({
            matricula: z.string(),
            marca: z.string(),
            inspeccao: z.string(),
            seguro: z.string(),
            foto: z.string(),
        })

        const { matricula, marca, inspeccao, seguro, foto } = createViaturaBodySchema.parse(request.body);

        await knex('viatura').insert({
            id: randomUUID(),
            matricula,
            marca,
            inspeccao,
            seguro,
            foto,
        })

        return reply.status(201).send();
    })

    // PUT atualizar viatura por ID
    app.put('/viatura/:id', async (request, reply) => {
        const getViaturaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateViaturaBodySchema = z.object({
            matricula: z.string().optional(),
            marca: z.string().optional(),
            inspeccao: z.string().optional(),
            seguro: z.string().optional(),
            foto: z.string().optional(),
        })

        const { id } = getViaturaParamsSchema.parse(request.params)
        const data = updateViaturaBodySchema.parse(request.body)

        const updated = await knex('viatura').where('id', id).update(data)

        if (updated === 0) {
            return reply.status(404).send({ message: 'Viatura não encontrada' })
        }

        return reply.send({ message: 'Viatura atualizada com sucesso' })
    })

    // DELETE viatura por ID
    app.delete('/viatura/:id', async (request, reply) => {
        const getViaturaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getViaturaParamsSchema.parse(request.params)

        const deleted = await knex('viatura').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Viatura não encontrada' })
        }

        return reply.send({ message: 'Viatura deletada com sucesso' })
    })
}
