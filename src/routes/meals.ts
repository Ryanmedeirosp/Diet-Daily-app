import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import crypto from 'node:crypto'
import { z } from 'zod'
import { checkSessionId } from '../middleware/check-sessionId'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const bodySchema = z.object({
        title: z.string(),
        description: z.string(),
        onDiet: z.boolean(),
        date: z.coerce.date(),
      })
      const { title, description, onDiet, date } = bodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: crypto.randomUUID(),
        title,
        description,
        on_diet: onDiet,
        date: date.getTime(),
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )
  app.get(
    '/',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const meals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('date', 'desc')
      return { meals }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const mealsParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = mealsParams.parse(request.params)
      const meals = await knex('meals')
        .where({
          user_id: request.user?.id,
          id,
        })
        .first()

      return { meals }
    },
  )
  app.get(
    '/summary',
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const meals = await knex('meals')
        .where({ user_id: request.user?.id })
        .orderBy('date', 'desc')
      let contadorRef = 0
      let contadorRefDentro = 0
      let contadorRefFora = 0
      let sequenciaAtual = 0
      let melhorSequencia = 0
      for (const meal of meals) {
        const isOnDiet = Boolean(meal.on_diet)

        if (isOnDiet) {
          contadorRefDentro += 1
          sequenciaAtual += 1
        } else {
          contadorRefFora += 1
          sequenciaAtual = 0
        }
        if (sequenciaAtual > melhorSequencia) {
          melhorSequencia = sequenciaAtual
        }

        contadorRef += 1
      }
      return {
        summary: {
          'Total Refeições': contadorRef,
          'Refeição Dentro da Dieta': contadorRefDentro,
          'Refeição Fora da Dieta': contadorRefFora,
          'Melhor sequencia:': melhorSequencia,
        },
      }
    },
  )
  app.delete(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const mealsParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = mealsParams.parse(request.params)
      const meals = await knex('meals')
        .where({
          user_id: request.user?.id,
          id,
        })
        .first()
        .delete()
      if (meals) {
        return reply.status(204).send()
      } else {
        return reply.status(404).send('not found')
      }
    },
  )
  app.put(
    '/:id',
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const mealsParams = z.object({
        id: z.string().uuid(),
      })
      const bodySchema = z.object({
        title: z.string(),
        description: z.string(),
        onDiet: z.boolean(),
        date: z.coerce.date(),
      })
      const { id } = mealsParams.parse(request.params)
      const { title, description, onDiet, date } = bodySchema.parse(
        request.body,
      )
      await knex('meals')
        .where({
          user_id: request.user?.id,
          id,
        })
        .first()
        .update({ title, description, on_diet: onDiet, date: date.getTime() })
      return reply.status(201).send()
    },
  )
}
