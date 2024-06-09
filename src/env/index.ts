import 'dotenv/config'
import {z} from 'zod'


const envSchema = z.object({
    NODE_ENV: z.enum (['development', 'test', 'production']).default('production'),
    DATABASE_URL: z.string(), 
    PORT: z.number().default(3333), 
    JWT_SECRET: z.string().default('palavra_pass'),
})

const _env = envSchema.safeParse(process.env)

if(_env.success == false){
    console.error('⚠️Variavel com erro', _env.error.format())
    throw new Error ('Variavel invalida')
}

export const env =_env.data
