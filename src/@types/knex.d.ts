// eslint-disable-next-line
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    user: {
      id: string
      session_id: string
      name: string
      email: string
      created_at: string
    }
    meals: {
      id: string
      user_id: string
      title: string
      description: string
      on_diet: boolean
      date: number
      created_at: string
      updated_at: string
    }
  }
}
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      email: string
      session_id: string
      name: string
      created_at: string
    }
  }
}
