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
            contacto: string
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
            lotacao: number
            motorista_id: string | null
        }

        rotas: {
            id: string
            hora_chegada: string
            hora_partida: string
            descricao: string
            viatura_id: string | null
        }

        motorista_rotas: {
            id: string
            motorista_id: string
            rota_id: string
            created_at: string
            updated_at: string
        }

        motorista_estudantes: {
            id: string
            motorista_id: string
            estudante_id: string
            viatura_id: string 
            created_at: string
            updated_at: string
            }

            avaliacoes: {
                id: string
                estudante_id: string
                motorista_id: string
                avaliacao: number
                comentario: string | null
                created_at: string
                updated_at: string
                }


                relatorios: {
                    id: string
                    tipo: string
                    dados: string
                    created_at: string
                    updated_at: string
                }


    }
}