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
      {
        create: async ({userId, content, createdAt}) => {
          expect(userId).toBe(initUserId)
          must.be.notEmptyString(content)
          createMethodCalled = true
          return tokenDTO.clone({
            id: 0, userId, createdAt: createdAt, content
          })
        }
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

  it('verify token expired', async () => {
    let findMethodCalled = false
    let deleteMethodCalled = false
    const initUserId = 42
    const nowDate = new Date()
    const secret = process.env.JWT_SECRET
    const expTerm = Number(process.env.JWT_EXP_TERM)
    const fakeTokenDTOId= 123

    const validExpiredToken = jwt.sign({
      sub: initUserId,
      iat: +nowDate - expTerm - 1,
      expTerm: +nowDate - 1
    }, secret)

    /** @type {TokenDTO} */
    const tokenDTO = app.get('app.domain.Auth.entities.TokenDTO')

    // Mock TokenDAO
    container.instanceForce('app.domain.Auth.repositories.TokenDAO', new ImportedTokenDAOMock({
        find: async ({tokenContent}) => {
          must.be.notEmptyString(tokenContent)
          findMethodCalled = true
          return tokenDTO.clone({
            id: fakeTokenDTOId, userId: initUserId, createdAt: new Date(+nowDate - expTerm - 1), content: tokenContent
          })
        },
        delete: async ({tokenDTO}) => {
          expect(tokenDTO.id).toBe(fakeTokenDTOId)
          deleteMethodCalled = true
        }
      }, tokenDTO
    ))

    /** @type {TokenService} */
    const tokenService = app.get('app.domain.Auth.services.TokenService')

    const dto = await tokenService.verify(validExpiredToken)

    expect(findMethodCalled).toBe(true)
    expect(deleteMethodCalled).toBe(true)
    expect(dto).toBe(null)
  })

  it('verify token positive', async () => {
    let findMethodCalled = false
    let deleteMethodCalled = false
    const initUserId = 42
    const nowDate = new Date()
    const secret = process.env.JWT_SECRET
    const expTerm = Number(process.env.JWT_EXP_TERM)
    const fakeTokenDTOId= 123

    const validToken = jwt.sign({
      sub: initUserId,
      iat: +nowDate,
      expTerm: +nowDate + expTerm,
    }, secret)

    /** @type {TokenDTO} */
    const tokenDTO = app.get('app.domain.Auth.entities.TokenDTO')

    // Mock TokenDAO
    container.instanceForce('app.domain.Auth.repositories.TokenDAO', new ImportedTokenDAOMock({
        find: async ({tokenContent}) => {
          must.be.notEmptyString(tokenContent)
          findMethodCalled = true
          return tokenDTO.clone({
            id: fakeTokenDTOId, userId: initUserId, createdAt: new Date(nowDate), content: tokenContent
          })
        },
        delete: async ({tokenDTO}) => {
          expect(tokenDTO.id).toBe(fakeTokenDTOId)
          deleteMethodCalled = true
        }
      }, tokenDTO
    ))

    /** @type {TokenService} */
    const tokenService = app.get('app.domain.Auth.services.TokenService')

    const dto = await tokenService.verify(validToken)

    expect(findMethodCalled).toBe(true)
    expect(deleteMethodCalled).toBe(false)
    expect(dto.userId).toBe(initUserId)
    expect(+dto.createdAt).toBe(+nowDate)
    expect(dto.content).toBe(validToken)
  })

  it('verify token user id does not much', async () => {
    let findMethodCalled = false
    let deleteMethodCalled = false
    const initUserId = 42
    const dbUserId = 66
    const nowDate = new Date()
    const secret = process.env.JWT_SECRET
    const expTerm = Number(process.env.JWT_EXP_TERM)
    const fakeTokenDTOId= 123

    const validToken = jwt.sign({
      sub: initUserId,
      iat: +nowDate,
      expTerm: +nowDate + expTerm,
    }, secret)

    /** @type {TokenDTO} */
    const tokenDTO = app.get('app.domain.Auth.entities.TokenDTO')

    // Mock TokenDAO
    container.instanceForce('app.domain.Auth.repositories.TokenDAO', new ImportedTokenDAOMock({
        find: async ({tokenContent}) => {
          must.be.notEmptyString(tokenContent)
          findMethodCalled = true
          return tokenDTO.clone({
            id: fakeTokenDTOId, userId: dbUserId, createdAt: new Date(nowDate), content: tokenContent
          })
        },
        delete: async ({tokenDTO}) => {
          expect(tokenDTO.id).toBe(fakeTokenDTOId)
          deleteMethodCalled = true
        }
      }, tokenDTO
    ))

    /** @type {TokenService} */
    const tokenService = app.get('app.domain.Auth.services.TokenService')

    const dto = await tokenService.verify(validToken)

    expect(findMethodCalled).toBe(true)
    expect(deleteMethodCalled).toBe(false)
    expect(dto).toBe(null)
  })

  it('verify token wrong', async () => {
    let findMethodCalled = false
    let deleteMethodCalled = false
    const initUserId = 42
    const nowDate = new Date()
    const expTerm = Number(process.env.JWT_EXP_TERM)

    const validToken = jwt.sign({
      sub: initUserId,
      iat: +nowDate,
      expTerm: +nowDate + expTerm,
    }, 'not actually the secret')

    /** @type {TokenDTO} */
    const tokenDTO = app.get('app.domain.Auth.entities.TokenDTO')

    // Mock TokenDAO
    container.instanceForce('app.domain.Auth.repositories.TokenDAO', new ImportedTokenDAOMock({
        find: async ({tokenContent}) => {
          findMethodCalled = true
        },
        delete: async ({tokenDTO}) => {
          deleteMethodCalled = true
        }
      }, tokenDTO
    ))

    /** @type {TokenService} */
    const tokenService = app.get('app.domain.Auth.services.TokenService')

    const dto = await tokenService.verify(validToken)

    expect(findMethodCalled).toBe(false)
    expect(deleteMethodCalled).toBe(false)
    expect(dto).toBe(null)
  })
})