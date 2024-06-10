import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import jwt from 'jsonwebtoken' // Importação de jwt 
import '../routes/types' 

const JWT_SECRET = 'secreto'

interface CreateUserRequestBody {
    nome: string
    email: string
    password: string
    nivel_acesso: 'estudante' | 'motorista' | 'administrador'
}

interface UpdateUserRequestBody {
    nome?: string
    email?: string
    password?: string
    nivel_acesso?: 'estudante' | 'motorista' | 'administrador'
}

export async function usuariosRoutes(app: FastifyInstance) {
    // GET listar usuarios
    app.get('/usuario', async () => {
        const usuarios = await knex('usuarios').select()
        return usuarios
    })

    // PUT atualizar por ID
    app.put('/usuario/:id', async (request, reply) => {
        const getUserParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateUserBodySchema = z.object({
            nome: z.string().optional(),
            email: z.string().optional(),
            password: z.string().optional(),
            nivel_acesso: z.enum(['estudante', 'motorista', 'administrador']).optional(),
        })

        const { id } = getUserParamsSchema.parse(request.params)
        const data = updateUserBodySchema.parse(request.body as UpdateUserRequestBody)

        const updated = await knex('usuarios').where('id', id).update(data)

        if (updated === 0) {
            return reply.status(404).send({ message: 'Usuário não encontrado' })
        }

        return reply.send({ message: 'Usuário atualizado com sucesso' })
    })

    // POST criar usuarios
    app.post('/usuario', async (request, reply) => {
        const createUsuarioBodySchema = z.object({
            nome: z.string(),
            email: z.string(),
            password: z.string(),
            nivel_acesso: z.enum(['estudante', 'motorista', 'administrador']),
        })

        const { nome, email, password, nivel_acesso } = createUsuarioBodySchema.parse(request.body as CreateUserRequestBody)

        await knex('usuarios').insert({
            id: randomUUID(),
            nome,
            email,
            password,
            nivel_acesso,
        })

        return reply.status(201).send()
    })

    // DELETE por ID do usuario
    app.delete('/usuario/:id', async (request, reply) => {
        const getUserParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getUserParamsSchema.parse(request.params)

        const deleted = await knex('usuarios').where('id', id).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: 'Usuário não encontrado' })
        }

        return reply.send({ message: 'Usuário deletado com sucesso' })
    })

    // Rota para lidar com o login
    app.post('/login', async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string }

        // Verifique as credenciais do usuário no banco de dados
        const user = await knex('usuarios').where({ email, password }).first()

        if (!user) {
            return reply.status(401).send({ message: 'Credenciais inválidas' })
        }

        // Gere um token de acesso
        const token = jwt.sign({ id: user.id, nivel_acesso: user.nivel_acesso }, JWT_SECRET, { expiresIn: '1h' })

        // Envia o token e o nível de acesso de volta para o cliente
        return reply.send({ token, nivel_acesso: user.nivel_acesso })
    })
}
