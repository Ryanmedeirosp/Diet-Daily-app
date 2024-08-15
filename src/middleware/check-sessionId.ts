import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkSessionId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  const user = await knex('user').where({ session_id: sessionId }).first()

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
  request.user = user
}
