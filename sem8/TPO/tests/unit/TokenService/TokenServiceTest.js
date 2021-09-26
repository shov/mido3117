'use strict'

const app = require('../../bootstrap')
const ImportedTokenDAOMock = require('./TokenDAOMock')
const {must} = toweran
const jwt = require('jsonwebtoken')

describe('TokenServiceTest', () => {
  /** @type {ContainerInterface} */
  let container = app.get('container')

  beforeAll(() => {
    app.register().boot()
  })

  it('create token positive', async () => {
    const initUserId = 42
    let createMethodCalled = false

    /** @type {TokenDTO} */
    const tokenDTO = app.get('app.domain.Auth.entities.TokenDTO')

    // Mock TokenDAO
    container.instanceForce('app.domain.Auth.repositories.TokenDAO', new ImportedTokenDAOMock(
      async ({userId, content, createdAt}) => {
        expect(userId).toBe(initUserId)
        must.be.notEmptyString(content)
        createMethodCalled = true
        return tokenDTO.clone({
          id: 0, userId, createdAt: createdAt, content
        })
      }, tokenDTO
    ))

    /** @type {TokenService} */
    const tokenService = app.get('app.domain.Auth.services.TokenService')
    const secret = process.env.JWT_SECRET

    const dto = await tokenService.create({id: initUserId})

    expect(createMethodCalled).toBe(true)
    const payload = jwt.verify(dto.content, secret)
    expect(typeof payload).toBe('object')
    expect(payload.sub).toBe(initUserId)
    expect(payload.exp).toBe(+dto.createdAt + Number(process.env.JWT_EXP_TERM))
  })
})