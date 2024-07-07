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
            lotacao: z.number().optional().default(17),
            motorista_id: z.string().uuid(),
        });

        const { matricula, marca, inspeccao, seguro, foto, lotacao, motorista_id } = createViaturaBodySchema.parse(request.body)

        await knex('viatura').insert({
            id: randomUUID(),
            matricula,
            marca,
            inspeccao,
            seguro,
            foto,
            lotacao,
            motorista_id,
        });

        return reply.status(201).send({ message: 'Viatura criada com sucesso' })
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
            lotacao: z.number().optional(),
            motorista_id: z.string().uuid().optional(),
        })

        const { id } = getViaturaParamsSchema.parse(request.params)
        const data = updateViaturaBodySchema.parse(request.body);

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

    // POST selecionar viatura
    app.post('/selecionar-viatura', async (request, reply) => {
        const selecionarViaturaBodySchema = z.object({
            estudante_id: z.string().uuid(),
            viatura_id: z.string().uuid(),
        })

        const { estudante_id, viatura_id } = selecionarViaturaBodySchema.parse(request.body)

        // Verifica a lotação da viatura
        const viatura = await knex('viatura').where({ id: viatura_id }).first()
        const estudantesNaViatura = await knex('motorista_estudantes').where({ viatura_id }).count()

        if (!viatura) {
            return reply.status(404).send({ message: 'Viatura não encontrada' })
        }

        if (Number(estudantesNaViatura[0].count) >= viatura.lotacao) {
            return reply.status(400).send({ message: 'Viatura lotada' })
        }

        // Verifica se o estudante já está associado a alguma viatura
        const estudanteAssociado = await knex('motorista_estudantes').where({ estudante_id }).first()
        if (estudanteAssociado) {
            return reply.status(400).send({ message: 'Estudante já associado a uma viatura' })
        }

        // Associa o estudante à viatura
        await knex('motorista_estudantes').insert({
            id: randomUUID(),
            estudante_id,
            viatura_id,
        })

        return reply.status(201).send({ message: 'Viatura selecionada com sucesso' })
    })
}
