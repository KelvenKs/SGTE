import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import multer from 'fastify-multer'
import path from 'path'

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Pasta onde as imagens serão salvas
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

export async function estudantesRoutes(app: FastifyInstance) {
    // Registrar o plugin multer no Fastify
    app.register(multer.contentParser)

    // GET listar estudantes
    app.get('/estudante', async () => {
        const estudantes = await knex('estudantes').select()
        return estudantes
    })

    // POST criar estudante
    app.post('/estudante', { preHandler: upload.single('foto') }, async (request, reply) => {
        const createEstudanteBodySchema = z.object({
            usuario_id: z.string().uuid(),
            idade: z.number().int().positive(),
            contacto_responsavel: z.string(),
            classe: z.string(),
            turma: z.string(),
        })

        const { usuario_id, idade, contacto_responsavel, classe, turma } = createEstudanteBodySchema.parse(request.body)
        const fotoPath = request.file?.path // Caminho da foto salva

        await knex('estudantes').insert({
            id: randomUUID(),
            usuario_id,
            idade,
            contacto_responsavel,
            classe,
            turma,
            foto: fotoPath, // Armazena o caminho da foto
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
