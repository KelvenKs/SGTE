import fastify from 'fastify'
import { env } from './env'
import { usuariosRoutes } from './routes/usuarios'
import { motoristasRoutes } from './routes/motoristas'
import { estudantesRoutes } from './routes/estudantes'
import { viaturasRoutes } from './routes/viaturas'
import { rotasRoutes } from './routes/rotas'
import { avaliacoesRoutes } from './routes/avaliacoes'
import { relatoriosRoutes } from './routes/relatorios'
import { authenticate } from './routes/authMiddleware'
import cors from '@fastify/cors'

const app = fastify()

// Registra o plugin @fastify/cors
app.register(cors, { 
    origin: 'http://localhost:3000', // Permite requisições de localhost:3000
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Permite todos os métodos
})

app.register(usuariosRoutes)
app.register(motoristasRoutes)
app.register(estudantesRoutes)
app.register(viaturasRoutes)
app.register(rotasRoutes)

app.register(avaliacoesRoutes)
app.register(relatoriosRoutes)

app.listen({ port: env.PORT }).then(() => {
    console.log('Servidor HTTP Funcionando!')
})
