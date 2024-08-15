import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto from 'node:crypto'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })
    const { name, email } = bodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    const verifyEmail = await knex('user').where({ email }).first()
    if (verifyEmail) {
      return reply.status(400).send({ message: 'user already exists' })
    }
    await knex('user').insert({
      id: crypto.randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
