import { FastifyRequest } from 'fastify'

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string
            nivel_acesso: 'estudante' | 'motorista' | 'administrador'
        }
    }
}
