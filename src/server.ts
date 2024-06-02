import fastify from 'fastify'
import crypto, { randomUUID } from 'node:crypto'
import { knex } from './database'
import { env } from './env'
import { usuariosRoutes } from './routes/usuarios'
import { motoristasRoutes } from './routes/motoristas'
import { estudantesRoutes } from './routes/estudantes'
import { viaturasRoutes } from './routes/viaturas'


const app = fastify ()

app.register(usuariosRoutes)
app.register(motoristasRoutes)
app.register(estudantesRoutes)
app.register(viaturasRoutes)


app.listen({
    
    port: env.PORT,
}).then(() =>{
    console.log('Servidor HTTP Funcionando!')
})
