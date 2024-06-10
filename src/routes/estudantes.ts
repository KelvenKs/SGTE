import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'

export async function estudantesRoutes(app: FastifyInstance) {
    // GET listar estudantes
    app.get('/estudante', async () => {
        const estudantes = await knex('estudantes').select()
        return estudantes
    })

    // POST criar estudante
    app.post('/estudante', async (request, reply) => {
        const createEstudanteBodySchema = z.object({
            usuario_id: z.string().uuid(),
            idade: z.number().int().positive(),
            contacto_responsavel: z.string(),
            classe: z.string(),
            turma: z.string(),
            foto: z.string(),
        })

        const { usuario_id, idade, contacto_responsavel, classe, turma, foto } = createEstudanteBodySchema.parse(request.body)

        await knex('estudantes').insert({
            id: randomUUID(),
            usuario_id,
            idade,
            contacto_responsavel,
            classe,
            turma,
            foto,
        })

        return reply.status(201).send()
    })

    // PUT atualizar estudante por ID
    app.put('/estudante/:id', async (request, reply) => {
        const getEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateEstudanteBodySchema = z.object({
            idade: z.number().int().positive().optional(),
            contacto_responsavel: z.string().optional(),
            classe: z.string().optional(),
            turma: z.string().optional(),
            foto: z.string().optional(),
        })

        const { id } = getEstudanteParamsSchema.parse(request.params);
        const data = updateEstudanteBodySchema.parse(request.body);

        const updated = await knex('estudantes').where('id', id).update(data);

        if (updated === 0) {
            return reply.status(404).send({ message: 'Estudante não encontrado' })
        }

        return reply.send({ message: 'Estudante atualizado com sucesso' })
    });

    // DELETE estudante por ID
    app.delete('/estudante/:id', async (request, reply) => {
        const getEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getEstudanteParamsSchema.parse(request.params)

        const deleted = await knex('estudantes').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Estudante não encontrado' })
        }

        return reply.send({ message: 'Estudante deletado com sucesso' })
    })
}
