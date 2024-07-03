// estudantes.ts
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import multer from 'fastify-multer'

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
            idade: z.number().int().positive(),
            contacto_responsavel: z.string().regex(/^\d{9}$/), // Adicionando validação para 9 dígitos,
            classe: z.string(),
            turma: z.string(),
        })

        const { idade, contacto_responsavel, classe, turma } = createEstudanteBodySchema.parse(request.body)
        const fotoPath = request.file?.path // Caminho da foto salva

        try {
            // Inserir o estudante e retornar o usuario_id do último usuário inserido
            const [usuarioId] = await knex('estudantes')
                .insert({
                    id: randomUUID(),
                    idade,
                    contacto_responsavel,
                    classe,
                    turma,
                    foto: fotoPath, // Armazena o caminho da foto
                })
                .returning('usuario_id')

            if (!usuarioId) {
                return reply.status(500).send({ message: 'Nenhum usuário foi inserido antes deste estudante' })
            }

            return reply.status(201).send()
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao criar estudante' })
        }
    })

    // PUT atualizar estudante por ID
    app.put('/estudante/:id', async (request, reply) => {
        const getEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateEstudanteBodySchema = z.object({
            idade: z.number().int().positive().optional(),
            contacto_responsavel: z.string().regex(/^\d{9}$/), // Adicionando validação para 9 dígitos,
            classe: z.string().optional(),
            turma: z.string().optional(),
            foto: z.string().optional(),
        })

        const { id } = getEstudanteParamsSchema.parse(request.params);
        const data = updateEstudanteBodySchema.parse(request.body);

        try {
            const updated = await knex('estudantes').where('id', id).update(data);

            if (updated === 0) {
                return reply.status(404).send({ message: 'Estudante não encontrado' })
            }

            return reply.send({ message: 'Estudante atualizado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao atualizar estudante' })
        }
    });

    // DELETE estudante por ID
    app.delete('/estudante/:id', async (request, reply) => {
        const getEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getEstudanteParamsSchema.parse(request.params)

        try {
            const deleted = await knex('estudantes').where('id', id).delete()

            if (deleted === 0) {
                return reply.status(404).send({ message: 'Estudante não encontrado' })
            }

            return reply.send({ message: 'Estudante deletado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao deletar estudante' })
        }
    })
}
