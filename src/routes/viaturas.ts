import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { knex } from '../database';

export async function viaturasRoutes(app: FastifyInstance) {
    // GET listar viaturas
    app.get('/viatura', async () => {
        const viaturas = await knex('viatura')
            .join('motoristas', 'viatura.motorista_id', 'motoristas.id')
            .join('usuarios', 'motoristas.usuario_id', 'usuarios.id')
            .leftJoin('presencas', 'viatura.id', 'presencas.viatura_id')
            .leftJoin('avaliacoes', 'motoristas.id', 'avaliacoes.motoristas_id')
            .select(
                'viatura.id',
                'viatura.matricula',
                'viatura.marca',
                'viatura.inspeccao',
                'viatura.seguro',
                'viatura.foto as viatura_foto',
                'viatura.lotacao',
                'motoristas.id as motorista_id',
                'usuarios.nome as motorista_nome',
                'usuarios.email as motorista_email',
                'motoristas.licenca as motorista_licenca',
                'motoristas.registo_criminal as motorista_registo_criminal',
                'motoristas.foto as motorista_foto',
                knex.raw('count(distinct presencas.id) as presencas'),
                knex.raw('avg(avaliacoes.avaliacao) as media_avaliacao')
            )
            .groupBy(
                'viatura.id',
                'motoristas.id',
                'usuarios.id'
            );

        return viaturas;
    });

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

        const { matricula, marca, inspeccao, seguro, foto, lotacao, motorista_id } = createViaturaBodySchema.parse(request.body);

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

        return reply.status(201).send({ message: 'Viatura criada com sucesso' });
    });

    // PUT atualizar viatura por ID
    app.put('/viatura/:id', async (request, reply) => {
        const getViaturaParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const updateViaturaBodySchema = z.object({
            matricula: z.string().optional(),
            marca: z.string().optional(),
            inspeccao: z.string().optional(),
            seguro: z.string().optional(),
            foto: z.string().optional(),
            lotacao: z.number().optional(),
            motorista_id: z.string().uuid().optional(),
        });

        const { id } = getViaturaParamsSchema.parse(request.params);
        const data = updateViaturaBodySchema.parse(request.body);

        const updated = await knex('viatura').where('id', id).update(data);

        if (updated === 0) {
            return reply.status(404).send({ message: 'Viatura não encontrada' });
        }

        return reply.send({ message: 'Viatura atualizada com sucesso' });
    });

    // DELETE viatura por ID
    app.delete('/viatura/:id', async (request, reply) => {
        const getViaturaParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getViaturaParamsSchema.parse(request.params);

        const deleted = await knex('viatura').where('id', id).delete();

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Viatura não encontrada' });
        }

        return reply.send({ message: 'Viatura deletada com sucesso' });
    });
}
