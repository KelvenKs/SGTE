import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function motoristaEstudantesRoutes(app: FastifyInstance) {
    // GET listar relação entre motoristas e estudantes
    app.get('/motorista_estudante', async () => {
        const motoristaEstudantes = await knex('motorista_estudantes').select()
        return motoristaEstudantes;
    })

    // POST criar relação entre motorista e estudante
    app.post('/motorista_estudantes', async (request, reply) => {
        const createMotoristaEstudanteBodySchema = z.object({
            motorista_id: z.string().uuid(),
            estudante_id: z.string().uuid(),
        })

        const { motorista_id, estudante_id } = createMotoristaEstudanteBodySchema.parse(request.body)

        // Verificar se o motorista está associado à viatura do estudante
        const isAssociated = await knex('viaturas')
            .join('motoristas', 'viaturas.id', 'motoristas.viatura_id')
            .join('estudantes', 'viaturas.id', 'estudantes.viatura_id')
            .where('motoristas.id', motorista_id)
            .where('estudantes.id', estudante_id)
            .select('viaturas.id')
            .first()

        if (!isAssociated) {
            return reply.status(403).send({ message: 'Motorista não tem permissão para acessar este estudante' })
        }

        await knex('motorista_estudantes').insert({
            id: randomUUID(),
            motorista_id,
            estudante_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        return reply.status(201).send()
    })

    // PUT atualizar relação entre motorista e estudante por ID
    app.put('/motorista_estudantes/:id', async (request, reply) => {
        const getMotoristaEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateMotoristaEstudanteBodySchema = z.object({
            motorista_id: z.string().uuid().optional(),
            estudante_id: z.string().uuid().optional(),
        })

        const { id } = getMotoristaEstudanteParamsSchema.parse(request.params)
        const data = updateMotoristaEstudanteBodySchema.parse(request.body)

        // Verificar se o motorista está associado à viatura do estudante
        const isAssociated = await knex('viaturas')
            .join('motoristas', 'viaturas.id', 'motoristas.viatura_id')
            .join('estudantes', 'viaturas.id', 'estudantes.viatura_id')
            .where('motoristas.id', data.motorista_id || '')
            .where('estudantes.id', data.estudante_id || '')
            .select('viaturas.id')
            .first()

        if (!isAssociated) {
            return reply.status(403).send({ message: 'Motorista não tem permissão para acessar este estudante' })
        }

        const updated = await knex('motorista_estudantes').where('id', id).update({
            ...data,
            updated_at: new Date().toISOString(),
        })

        if (updated === 0) {
            return reply.status(404).send({ message: 'Relação entre motorista e estudante não encontrada' })
        }

        return reply.send({ message: 'Relação entre motorista e estudante atualizada com sucesso' })
    })

    // DELETE relação entre motorista e estudante por ID
    app.delete('/motorista_estudantes/:id', async (request, reply) => {
        const getMotoristaEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getMotoristaEstudanteParamsSchema.parse(request.params)

        // Buscar a relação para verificar a associação do motorista
        const motoristaEstudante = await knex('motorista_estudantes')
            .where('id', id)
            .select('motorista_id', 'estudante_id')
            .first()

        if (!motoristaEstudante) {
            return reply.status(404).send({ message: 'Relação entre motorista e estudante não encontrada' })
        }

        // Verificar se o motorista está associado à viatura do estudante
        const isAssociated = await knex('viaturas')
            .join('motoristas', 'viaturas.id', 'motoristas.viatura_id')
            .join('estudantes', 'viaturas.id', 'estudantes.viatura_id')
            .where('motoristas.id', motoristaEstudante.motorista_id)
            .where('estudantes.id', motoristaEstudante.estudante_id)
            .select('viaturas.id')
            .first()

        if (!isAssociated) {
            return reply.status(403).send({ message: 'Motorista não tem permissão para acessar este estudante' })
        }

        const deleted = await knex('motorista_estudantes').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Relação entre motorista e estudante não encontrada' })
        }

        return reply.send({ message: 'Relação entre motorista e estudante deletada com sucesso' })
    })
}
