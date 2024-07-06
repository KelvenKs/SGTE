import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import multer from 'fastify-multer'
import path from 'path'
import bcrypt from 'bcrypt'

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Pasta onde as imagens serão salvas
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
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

    // GET motorista por ID
    app.get('/motorista/:id', async (request, reply) => {
        const getMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getMotoristaParamsSchema.parse(request.params)

        try {
            const motorista = await knex('motoristas')
                .where({ id })
                .first()

            if (!motorista) {
                return reply.status(404).send({ message: 'Motorista não encontrado' })
            }

            return reply.status(200).send(motorista)
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao buscar motorista' })
        }
    })

    // POST criar motorista
    app.post('/motorista', { preHandler: upload.single('foto') }, async (request, reply) => {
        const createMotoristaBodySchema = z.object({
            nome: z.string(),
            email: z.string().email(),
            password: z.string(),
            licenca: z.string(),
            registo_criminal: z.string(),
            viatura_id: z.string().uuid().optional(),
            contacto: z.string().regex(/^\d{9}$/), // Adicionando validação para 9 dígitos
        })

        const { nome, email, password, licenca, registo_criminal, viatura_id, contacto } = createMotoristaBodySchema.parse(request.body)
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
                nivel_acesso: 'motorista',
            })
            .returning(['id'])

        if (!usuario || !usuario.id) {
            return reply.status(500).send({ message: 'Erro ao criar usuário' })
        }

        // Inserir o motorista usando o ID do usuário criado
        await knex('motoristas').insert({
            id: randomUUID(),
            usuario_id: usuario.id,
            licenca,
            registo_criminal,
            foto: fotoPath, // Armazena o caminho da foto 
            viatura_id: viatura_id || null,
            contacto, // Armazena o contacto
        })

        return reply.status(201).send({ message: 'Motorista criado com sucesso' })
    })

    // PUT atualizar motorista por ID
    app.put('/motorista/:id', { preHandler: upload.single('foto') }, async (request, reply) => {
        const updateMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateMotoristaBodySchema = z.object({
            licenca: z.string().optional(),
            registo_criminal: z.string().optional(),
            viatura_id: z.string().uuid().optional(),
            contacto: z.string().regex(/^\d{9}$/).optional(), // Adicionando validação para 9 dígitos
        })

        const { id } = updateMotoristaParamsSchema.parse(request.params)
        const { licenca, registo_criminal, viatura_id, contacto } = updateMotoristaBodySchema.parse(request.body)
        const fotoPath = request.file?.path // Caminho da foto salva, se for enviada uma nova foto

        // Construir o objeto de atualização
        const updateData: Record<string, any> = {}
        if (licenca) updateData.licenca = licenca
        if (registo_criminal) updateData.registo_criminal = registo_criminal
        if (viatura_id) updateData.viatura_id = viatura_id
        if (fotoPath) updateData.foto = fotoPath
        if (contacto) updateData.contacto = contacto // Atualiza o contacto

        try {
            const result = await knex('motoristas')
                .where({ id })
                .update(updateData)

            if (result === 0) {
                return reply.status(404).send({ message: 'Motorista não encontrado' })
            }

            return reply.status(200).send({ message: 'Motorista atualizado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao atualizar motorista' })
        }
    })

    // DELETE motorista por ID
    app.delete('/motorista/:id', async (request, reply) => {
        const deleteMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = deleteMotoristaParamsSchema.parse(request.params)

        try {
            const result = await knex('motoristas')
                .where({ id })
                .del()

            if (result === 0) {
                return reply.status(404).send({ message: 'Motorista não encontrado' })
            }

            return reply.status(200).send({ message: 'Motorista deletado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao deletar motorista' })
        }
    })
}
