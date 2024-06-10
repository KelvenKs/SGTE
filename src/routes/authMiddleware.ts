import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../env'; // Importando a configuração de ambiente

export function authenticate(request: FastifyRequest, reply: FastifyReply, done: Function) {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
        return reply.status(401).send({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string, nivel_acesso: 'estudante' | 'motorista' | 'administrador' };
        request.user = decoded;
        done();
    } catch (error) {
        return reply.status(401).send({ message: 'Token inválido' });
    }
}
