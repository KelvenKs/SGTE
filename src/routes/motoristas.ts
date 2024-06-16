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

export async function motoristasRoutes(app: FastifyInstance) {
    // Registrar o plugin multer no Fastify
    app.register(multer.contentParser)

    // GET listar motoristas
    app.get('/motorista', async () => {
        const motoristas = await knex('motoristas').select()
        return motoristas
    })

    // POST criar motorista
    app.post('/motorista', { preHandler: upload.single('foto') }, async (request, reply) => {
        const createMotoristaBodySchema = z.object({
            usuario_id: z.string().uuid(),
            licenca: z.string(),
            registo_criminal: z.string(),
            viatura_id: z.string().uuid().optional(),
        })

        const { usuario_id, licenca, registo_criminal, viatura_id } = createMotoristaBodySchema.parse(request.body)
        const fotoPath = request.file?.path // Caminho da foto salva

        await knex('motoristas').insert({
            id: randomUUID(),
            usuario_id,
            licenca,
            registo_criminal,
            foto: fotoPath, // Armazena o caminho da foto
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
