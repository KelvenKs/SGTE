import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import multer from 'fastify-multer'
import bcrypt from 'bcrypt'

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

    // GET estudante por ID
    app.get('/estudante/:id', async (request, reply) => {
    const getEstudanteParamsSchema = z.object({
        id: z.string().uuid(),
    })

    const { id } = getEstudanteParamsSchema.parse(request.params)

    try {
        const estudante = await knex('estudantes')
            .where({ id })
            .first()

        if (!estudante) {
            return reply.status(404).send({ message: 'Estudante não encontrado' })
        }

        return reply.status(200).send(estudante)
    } catch (error) {
        return reply.status(500).send({ message: 'Erro ao buscar estudante' })
    }
})    

    // POST criar estudante
    app.post('/estudante', { preHandler: upload.single('foto') }, async (request, reply) => {
        const createEstudanteBodySchema = z.object({
            nome: z.string(),
            email: z.string().email(),
            password: z.string(),
            idade: z.number().int().positive(),
            contacto_responsavel: z.string().regex(/^\d{9}$/), // Adicionando validação para 9 dígitos
            classe: z.string(),
            turma: z.string(),
        })

        const { nome, email, password, idade, contacto_responsavel, classe, turma } = createEstudanteBodySchema.parse(request.body)
        const fotoPath = request.file?.path // Caminho da foto salva

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10)

        // Criar o usuário primeiro
        const [usuario] = await knex('usuarios')
            .insert({
                id: randomUUID(),
                nome,
                email,
                password: hashedPassword,
                nivel_acesso: 'estudante',
            })
            .returning(['id'])

        if (!usuario || !usuario.id) {
            return reply.status(500).send({ message: 'Erro ao criar usuário' })
        }

        // Inserir o estudante usando o ID do usuário criado
        await knex('estudantes').insert({
            id: randomUUID(),
            usuario_id: usuario.id,
            idade,
            contacto_responsavel,
            classe,
            turma,
            foto: fotoPath, // Armazena o caminho da foto
        })

        return reply.status(201).send({ message: 'Estudante criado com sucesso' })
    })

    // PUT atualizar estudante por ID
    app.put('/estudante/:id', { preHandler: upload.single('foto') }, async (request, reply) => {
        const updateEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateEstudanteBodySchema = z.object({
            idade: z.number().int().positive().optional(),
            contacto_responsavel: z.string().regex(/^\d{9}$/).optional(), // Adicionando validação para 9 dígitos
            classe: z.string().optional(),
            turma: z.string().optional(),
            foto: z.string().optional(),
        })

        const { id } = updateEstudanteParamsSchema.parse(request.params)
        const { idade, contacto_responsavel, classe, turma } = updateEstudanteBodySchema.parse(request.body)
        const fotoPath = request.file?.path // Caminho da foto salva, se for enviada uma nova foto

        // Construir o objeto de atualização
        const updateData: Record<string, any> = {}
        if (idade) updateData.idade = idade
        if (contacto_responsavel) updateData.contacto_responsavel = contacto_responsavel
        if (classe) updateData.classe = classe
        if (turma) updateData.turma = turma
        if (fotoPath) updateData.foto = fotoPath

        try {
            const result = await knex('estudantes')
                .where({ id })
                .update(updateData)

            if (result === 0) {
                return reply.status(404).send({ message: 'Estudante não encontrado' })
            }

            return reply.status(200).send({ message: 'Estudante atualizado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao atualizar estudante' })
        }
    })

    // DELETE estudante por ID
    app.delete('/estudante/:id', async (request, reply) => {
        const deleteEstudanteParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = deleteEstudanteParamsSchema.parse(request.params)

        try {
            const result = await knex('estudantes')
                .where({ id })
                .del()

            if (result === 0) {
                return reply.status(404).send({ message: 'Estudante não encontrado' })
            }

            return reply.status(200).send({ message: 'Estudante deletado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao deletar estudante' })
        }
    })
}
