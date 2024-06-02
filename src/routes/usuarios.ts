import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import {knex} from '../database'


export async function usuariosRoutes(app:FastifyInstance){

    // GET listar usuarios
    app.get('/usuario', async () => {
    const usuarios = await knex('usuarios').select()
    return usuarios
    })


// PUT atualizar por ID
app.put('/usuario/:id', async (request, reply) => {
    const getUserParamsSchema = z.object({
        id: z.string().uuid()
    })

    const updateUserBodySchema = z.object({
        nome: z.string().optional(),
        email: z.string().optional(),
        password: z.string().optional(),
        nivel_acesso: z.enum(['estudante', 'motorista']).optional(),
    })

    const { id } = getUserParamsSchema.parse(request.params)
    const data = updateUserBodySchema.parse(request.body)

    const updated = await knex('usuarios').where('id', id).update(data)

    if (updated === 0) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
    }

    return reply.send({ message: 'Usuário atualizado com sucesso' })
    })

    

    

    // POST criar usuarios    
    app.post('/usuario', async(request, reply) => {
    
        const createUsuarioBodySchema = z.object({
            nome: z.string(),
            email: z.string(),
            password: z.string(),
            nivel_acesso: z.enum(['estudante', 'motorista']), 


        })

        const { nome, email, password, nivel_acesso} = createUsuarioBodySchema.parse(
            request.body,
        )

        await knex('usuarios')
        .insert({
            id: randomUUID(),
            nome,
            email,
            password,
            nivel_acesso
        

        })
        
        return reply.status(201).send()
    
    })

   // DELETE por ID do usuario
   app.delete('/usuario/:id', async (request, reply) => {
    const getUserParamsSchema = z.object({
        id: z.string().uuid()
    })

    const { id } = getUserParamsSchema.parse(request.params)

    const deleted = await knex('usuarios').where('id', id).delete()

    if (deleted === 0) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
    }

    return reply.send({ message: 'Usuário deletado com sucesso' })
})


}
