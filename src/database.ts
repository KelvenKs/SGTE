import {knex as setupKnex, Knex} from 'knex'
import { env } from './env'

export const config: Knex.Config = {
    client: 'mysql2',
    connection: {
        host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'sgte',
    },
    useNullAsDefault: true,
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    },
}   
export const knex = setupKnex(config)
