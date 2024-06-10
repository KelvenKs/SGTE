import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function relatoriosRoutes(app: FastifyInstance) {
    // GET listar relatórios
    app.get('/relatorios', async () => {
        const relatorios = await knex('relatorios').select()
        return relatorios
    })

    // POST criar relatório
    app.post('/relatorios', async (request, reply) => {
        const createRelatorioBodySchema = z.object({
            tipo: z.string(),
            dados: z.string(),
        })

        const { tipo, dados } = createRelatorioBodySchema.parse(request.body)

        await knex('relatorios').insert({
            id: randomUUID(),
            tipo,
            dados,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        return reply.status(201).send()
    })

    // PUT atualizar relatório por ID
    app.put('/relatorios/:id', async (request, reply) => {
        const getRelatorioParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateRelatorioBodySchema = z.object({
            tipo: z.string().optional(),
            dados: z.string().optional(),
        })

        const { id } = getRelatorioParamsSchema.parse(request.params)
        const data = updateRelatorioBodySchema.parse(request.body)

        const updated = await knex('relatorios').where('id', id).update({
            ...data,
            updated_at: new Date().toISOString(),
        })

        if (updated === 0) {
            return reply.status(404).send({ message: 'Relatório não encontrado' })
        }

        return reply.send({ message: 'Relatório atualizado com sucesso' })
    })

    // DELETE relatório por ID
    app.delete('/relatorios/:id', async (request, reply) => {
        const getRelatorioParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getRelatorioParamsSchema.parse(request.params)

        const deleted = await knex('relatorios').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Relatório não encontrado' })
        }

        return reply.send({ message: 'Relatório deletado com sucesso' })
    })
}
