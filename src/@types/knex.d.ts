import {Knex} from 'kenx'


declare module 'knex/types/tables'{
    export interface Tables{
        usuarios: {
            id: string
            nome: string
            email: string
            password: string
            nivel_acesso: string
        }
        motoristas: {
            id: string
            usuario_id: string
            licenca: string
            registo_criminal: string
            foto: string
            viatura_id: string | null
        }
        estudantes: {
            id: string
            usuario_id: string
            idade: number
            contacto_responsavel: string
            classe: string
            turma: string
            foto: string
        }

        viatura: {
            id: string
            matricula: string
            marca: string
            inspeccao: string
            seguro: string
            foto: string
        }
    }
}