'use strict'

const supertest = require('supertest')

/**
 * @type {App}
 */
const app = require('../bootstrap')

describe(`Auth Controller Test`, () => {
  let expressApp, request

  /** @type {MigrationManager} */
  let migrationManager

  /** @type {ContainerInterface} */
  let container

  beforeAll(() => {
    app
      .register()
      .boot()

    try {
      expressApp = app.get('expressApp')
      request = supertest(expressApp)
    } catch (e) {
      console.log(e.message)
    }

    container = app.get('container')
    migrationManager = app.get('migrationManager')
  })

  beforeEach(async () => {
    await migrationManager.refresh()
  })


  it(`Register positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }
    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')

    const res = await request.post('/api/v1/register')
      .send(data)

    expect(res.status).toBe(201)
    expect(typeof res?.body?.token).toBe('string')
    expect(typeof res?.body?.id).toBe('number')

    const userDTO = await userService.verify({tokenContent: res.body.token})
    expect(userDTO?.login).toBe(data.login)
    expect(res?.body?.id).toBe(userDTO.id)
  })

  ;[ // Cases with not valid login either password or user data
    {login: '1sahsa', password: '123456', user: {}},
    {login: 'q', password: '123456', user: {}},
    {login: 'sahsa12', password: 'qwe', user: {}},
    {login: 'sahsa', password: '123456///\/', user: {}},
    {login: 'sahsa', password: '123456', user: 1},
  ].forEach((data, i) => {
    it(`Register not valid #${i}`, async () => {
      /** @type {UserDAO} */
      const userDAO = container.get('app.domain.Auth.repositories.UserDAO')

      const res = await request.post('/api/v1/register')
        .send(data)

      const userDTO = await userDAO.findByLogin({login: data.login})

      expect(res.status).toBe(422)
      expect(userDTO).toBe(null)
      expect(Array.isArray(res?.body?.errors)).toBe(true)
    })
  })


  it(`Login positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }
    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')

    const resReg = await request.post('/api/v1/register')
      .send(data)

    const res = await request.post('/api/v1/login')
      .send({
        login: data.login,
        password: data.password,
      })

    expect(res.status).toBe(200)
    expect(typeof res?.body?.token).toBe('string')

    const userDTO = await userService.verify({tokenContent: res.body.token})
    expect(userDTO?.login).toBe(data.login)
  })

  it(`Login negative`, async () => {
    const res = await request.post('/api/v1/login')
      .send({
        login: 'xxxqqq',
        password: 'qqqwww',
      })

    expect(res.status).toBe(400)
    expect(!res?.body?.token).toBe(true)
  })

  it(`Logout positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }
    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')

    const resReg = await request.post('/api/v1/register')
      .send(data)

    const res = await request.delete('/api/v1/logout')
      .set('Authorization', `Bearer ${resReg.body.token}`)

    expect(res.status).toBe(204)

    const userDTO = await userService.verify({tokenContent: resReg.body.token})
    expect(userDTO).toBe(null)
  })

  it(`Verify positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }
    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')

    const resReg = await request.post('/api/v1/register')
      .send(data)

    const res = await request.get('/api/v1/verify')
      .set('Authorization', `Bearer ${resReg.body.token}`)

    expect(res.status).toBe(200)

    const userDTO = await userService.verify({tokenContent: resReg.body.token})
    expect(typeof userDTO?.id).toBe('number')
    expect(res.body?.id).toBe(userDTO.id)
    expect(res.body?.login).toBe(userDTO.login)
    expect(res.body?.user).toStrictEqual(userDTO.details)
  })

  it(`Refresh positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }
    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')

    const resReg = await request.post('/api/v1/register')
      .send(data)

    const res = await request.get('/api/v1/refresh')
      .set('Authorization', `Bearer ${resReg.body.token}`)

    expect(res.status).toBe(201)
    expect(typeof res.body?.token).toBe('string')
    expect(res.body.token === resReg.body.token).toBe(false)

    let userDTO = await userService.verify({tokenContent: resReg.body.token})
    expect(userDTO).toBe(null)

    userDTO = await userService.verify({tokenContent: res.body.token})
    expect(userDTO?.login).toBe(data.login)
  })

  it(`Update positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }

    const updateData = {
      password: 'newQwerty',
      user: {role: 'moderator'},
    }

    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')

    const resReg = await request.post('/api/v1/register')
      .send(data)

    let userDTO = await userService.verify({tokenContent: resReg.body.token})
    expect(typeof userDTO?.hash).toBe('string')
    const oldHash = userDTO.hash
    expect(userDTO.details).toStrictEqual(data.user)

    const res = await request.put(`/api/v1/users/${resReg.body.id}`)
      .set('Authorization', `Bearer ${resReg.body.token}`)
      .send(updateData)

    expect(res.status).toBe(204)

    userDTO = await userService.verify({tokenContent: resReg.body.token})
    expect(typeof userDTO?.hash).toBe('string')
    expect(oldHash === userDTO.hash).toBe(false)
    expect(userDTO.details).toStrictEqual(updateData.user)
  })

  it(`Delete positive`, async () => {
    const data = {
      login: 'sasha',
      password: '123456',
      user: {role: 'admin'}
    }
    /** @type {UserService} */
    const userService = container.get('app.domain.Auth.services.UserService')
    /** @type {UserDAO} */
    const userDAO = container.get('app.domain.Auth.repositories.UserDAO')
    /** @type {TokenDAO} */
    const tokenDAO = container.get('app.domain.Auth.repositories.TokenDAO')

    const resReg = await request.post('/api/v1/register')
      .send(data)

    const resLogin = await request.post('/api/v1/login')
      .send({
        login: data.login,
        password: data.password,
      })

    expect(typeof resReg.body?.token).toBe('string')
    expect(typeof resLogin.body?.token).toBe('string')
    expect(resLogin.body.token === resReg.body.token).toBe(false)

    const res = await request(`/api/v1/delete/users/${resReg.body.id}`)
      .set('Authorization', `Bearer ${resReg.body.token}`)

    expect(res.status).toBe(204)

    let userDTO = await userService.verify({tokenContent: resReg.body.token})
    expect(userDTO).toBe(null)

    userDTO = await userDAO.findByLogin({login: data.login})
    expect(userDTO).toBe(null)

    let tokenDTO = await tokenDAO.find({tokenContent: resReg.body.token})
    expect(tokenDTO).toBe(null)

    tokenDTO = await tokenDAO.find({tokenContent: resLogin.body.token})
    expect(tokenDTO).toBe(null)
  })
})