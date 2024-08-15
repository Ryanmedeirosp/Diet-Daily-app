import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('user and meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/user')
      .send({
        name: 'new transactions',
        email: 'email@gmail.com',
      })
      .expect(201)
  })

  it('should be able to create a nem meal', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'new transactions',
      email: 'email@gmail.com',
    })
    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        title: 'cafe da manha',
        description: 'sua ref de cafe da manha',
        onDiet: true,
        date: '2024-08-15T10:40:00',
      })
      .expect(201)
  })
  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'new transactions',
      email: 'email@gmail.com',
    })
    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: '2024-08-15T10:40:00',
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: '2024-08-15T10:40:00',
    })

    const getAllmeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(getAllmeals.body.meals).toHaveLength(2)
  })
  it('should be able to get specific meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'new transactions',
      email: 'email@gmail.com',
    })
    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: new Date(),
    })

    const getAllmeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const getId = getAllmeals.body.meals[0].id

    const specificMeal = await request(app.server)
      .get(`/meals/${getId}`)
      .set('Cookie', cookies)

    expect(specificMeal.body).toEqual({
      meals: expect.objectContaining({
        title: 'cafe da manha',
        description: 'sua ref de cafe da manha',
        on_diet: 1,
        date: expect.anything(),
      }),
    })
  })
  it('should be able to delete a specific meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'new transactions',
      email: 'email@gmail.com',
    })
    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: new Date(),
    })

    const getAllmeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const getId = getAllmeals.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${getId}`)
      .set('Cookie', cookies)
      .expect(204)
  })
  it('should be able to alt a specific meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'new transactions',
      email: 'email@gmail.com',
    })
    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: new Date(),
    })

    const getAllmeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const getId = getAllmeals.body.meals[0].id

    await request(app.server)
      .put(`/meals/${getId}`)
      .set('Cookie', cookies)
      .send({
        title: 'cafe da tarde',
        description: 'sua ref de cafe da seu',
        onDiet: true,
        date: new Date(),
      })

    const specificMeal = await request(app.server)
      .get(`/meals/${getId}`)
      .set('Cookie', cookies)

    expect(specificMeal.body).toEqual({
      meals: expect.objectContaining({
        title: 'cafe da tarde',
        description: 'sua ref de cafe da seu',
        on_diet: 1,
        date: expect.anything(),
      }),
    })
  })
  it('should be able get a summary of all meals', async () => {
    const createUserResponse = await request(app.server).post('/user').send({
      name: 'new transactions',
      email: 'email@gmail.com',
    })
    const cookies = createUserResponse.get('Set-Cookie') ?? []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: '2024-08-15T10:40:00',
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: false,
      date: '2024-08-15T10:40:00',
    })
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'cafe da manha',
      description: 'sua ref de cafe da manha',
      onDiet: true,
      date: '2024-08-15T10:40:00',
    })

    const getMealsSummary = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', cookies)

    expect(getMealsSummary.body).toEqual({
      summary: expect.objectContaining({
        'Total Refeições': 3,
        'Refeição Dentro da Dieta': 2,
        'Refeição Fora da Dieta': 1,
        'Melhor sequencia:': 1,
      }),
    })
  })
})
