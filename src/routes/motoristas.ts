import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import multer from 'fastify-multer'
import bcrypt from 'bcrypt'

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Pasta onde as imagens serão salvas
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({ storage: storage })

export async function motoristasRoutes(app: FastifyInstance) {
    // Registrar o plugin multer no Fastify
    app.register(multer.contentParser)

    // GET listar motoristas
app.get('/motorista', async () => {
    const motoristas = await knex('motoristas')
        .join('usuarios', 'motoristas.usuario_id', '=', 'usuarios.id')
        .select(
            'motoristas.id',
            'motoristas.usuario_id',
            'usuarios.nome',
            'usuarios.email',
            'usuarios.password',
            'usuarios.nivel_acesso',
            'motoristas.licenca',
            'motoristas.registo_criminal',
            'motoristas.foto',
            'motoristas.contacto'
        );
    return motoristas;
});

    // GET motorista por ID
    app.get('/motorista/:id', async (request, reply) => {
        const getMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = getMotoristaParamsSchema.parse(request.params)

        try {
            const motorista = await knex('motoristas')
                .join('usuarios', 'motoristas.usuario_id', '=', 'usuarios.id')
                .select(
                    'motoristas.id',
                    'motoristas.usuario_id',
                    'usuarios.nome',
                    'usuarios.email',
                    'motoristas.licenca',
                    'motoristas.registo_criminal',
                    'motoristas.foto',
                    'motoristas.contacto'
                )
                .where('motoristas.id', id)
                .first()

            if (!motorista) {
                return reply.status(404).send({ message: 'Motorista não encontrado' })
            }

            return reply.status(200).send(motorista)
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao buscar motorista' })
        }
    })

    // POST criar motorista
app.post('/motorista', { preHandler: upload.single('foto') }, async (request, reply) => {
    const createMotoristaBodySchema = z.object({
        nome: z.string(),
        email: z.string().email(),
        password: z.string(),
        licenca: z.string(),
        registo_criminal: z.string(),
        contacto: z.string().regex(/^\d{9}$/), // Adicionando validação para 9 dígitos
    })

    const { nome, email, password, licenca, registo_criminal, contacto } = createMotoristaBodySchema.parse(request.body)
    const fotoPath = request.file?.path || ''; // Definir um valor padrão quando não houver foto

    // Verifica se o email já está em uso
    const existingUser = await knex('usuarios').where({ email }).first()
    if (existingUser) {
        return reply.status(400).send({ message: 'Email já está em uso' })
    }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10)

        try {
            console.log('Tentando criar usuário...')

            // Criar o usuário primeiro
            const usuarioId = randomUUID(); // Gera um UUID para o usuário

            await knex.transaction(async (trx) => {
                // Insere o usuário dentro de uma transação
                await trx('usuarios').insert({
                    id: usuarioId,
                    nome,
                    email,
                    password: hashedPassword,
                    nivel_acesso: 'motorista',
                });

                // Inserir o motorista usando o ID do usuário criado
                await trx('motoristas').insert({
                    id: randomUUID(),
                    usuario_id: usuarioId,
                    licenca,
                    registo_criminal,
                    foto: fotoPath, // Armazena o caminho da foto 
                    contacto, // Armazena o contacto
                });
            });

            console.log('Motorista criado com sucesso!')

            return reply.status(201).send({ message: 'Motorista criado com sucesso' })
        } catch (error) {
            console.error('Erro ao criar motorista:', error) // Adicione logs
            return reply.status(500).send({ message: 'Erro ao criar usuário' })
        }
    })

    // PUT atualizar motorista por ID
    app.put('/motorista/:id', { preHandler: upload.single('foto') }, async (request, reply) => {
        const updateMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const updateMotoristaBodySchema = z.object({
            licenca: z.string().optional(),
            registo_criminal: z.string().optional(),
            contacto: z.string().regex(/^\d{9}$/).optional(), // Adicionando validação para 9 dígitos
        })

        const { id } = updateMotoristaParamsSchema.parse(request.params)
        const { licenca, registo_criminal, contacto } = updateMotoristaBodySchema.parse(request.body)
        const fotoPath = request.file?.path || null; // Caminho da foto salva, se for enviada uma nova foto

        // Construir o objeto de atualização
        const updateData: Record<string, any> = {}
        if (licenca) updateData.licenca = licenca
        if (registo_criminal) updateData.registo_criminal = registo_criminal
        if (fotoPath) updateData.foto = fotoPath
        if (contacto) updateData.contacto = contacto // Atualiza o contacto

        try {
            const result = await knex('motoristas')
                .where({ id })
                .update(updateData)

            if (result === 0) {
                return reply.status(404).send({ message: 'Motorista não encontrado' })
            }

            return reply.status(200).send({ message: 'Motorista atualizado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao atualizar motorista' })
        }
    })

    // DELETE motorista por ID
    app.delete('/motorista/:id', async (request, reply) => {
        const deleteMotoristaParamsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = deleteMotoristaParamsSchema.parse(request.params)

        try {
            const result = await knex('motoristas')
                .where({ id })
                .del()

            if (result === 0) {
                return reply.status(404).send({ message: 'Motorista não encontrado' })
            }

            return reply.status(200).send({ message: 'Motorista deletado com sucesso' })
        } catch (error) {
            return reply.status(500).send({ message: 'Erro ao deletar motorista' })
        }
    })
}
