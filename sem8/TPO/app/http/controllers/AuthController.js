'use strict'

const ImportedBasicController = toweran.BasicController
const {must, ValidationException, ForbiddenException} = toweran

/**
 * @extends BasicController
 */
class AuthController extends ImportedBasicController {
  /**
   * @DI validator
   * @DI app.domain.Auth.services.UserService
   * @param {Validator} validator
   * @param {UserService} userService
   */
  constructor(validator, userService) {
    super()

    /**
     * @type {Validator}
     * @protected
     */
    this._validator = validator

    /**
     * @type {UserService}
     * @protected
     */
    this._userService = userService

    this.HTTP = {...this.HTTP, NO_CONTENT: 204}
  }

  async register(req, res, next) {
    try {
      let message = null

      this._validator.validateObj(req.body, {
        login: ['required', 'regex:/^[A-Za-z][A-Za-z0-9_]{4,255}$/'],
        password: ['required', 'regex:/^[A-Za-z0-9!@#$%&*_\\-=+]{5,255}$/'],
        user: 'required|object-shape',
      }, errors => {
        message = errors.sum
      })

      if (message) {
        throw new ValidationException(message)
      }

      const {tokenDTO, userDTO} = await this._userService.register({
        login: req.body.login,
        password: req.body.password,
        userData: req.body.user,
      })

      res.status(this.HTTP.CREATED).send({
        id: userDTO.id,
        token: tokenDTO.content,
      })

    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      let message = null

      this._validator.validateObj(req.body, {
        login: ['required', 'regex:/^[A-Za-z][A-Za-z0-9_]{4,255}$/'],
        password: ['required', 'regex:/^[A-Za-z0-9!@#$%&*_\\-=+]{5,255}$/'],
      }, errors => {
        message = errors.sum
      })

      if (message) {
        throw new ValidationException(message)
      }

      const tokenDTO = await this._userService.login({
        login: req.body.login,
        password: req.body.password,
      })

      res.status(this.HTTP.OK).send({
        token: tokenDTO.content,
      })
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      must.be.notEmptyString(req.tokenContent)

      await this._userService.logout({tokenContent: req.tokenContent})

      res.status(this.HTTP.NO_CONTENT).send()
    } catch (e) {
      next(e)
    }
  }

  async verify(req, res, next) {
    try {
      must.be.object(req.userDTO)

      res.status(this.HTTP.OK).send({
        id: req.userDTO.id,
        login: req.userDTO.login,
        user: req.userDTO.details,
      })
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      must.be.notEmptyString(req.tokenContent)

      const tokenDTO = await this._userService.refresh({tokenContent: req.tokenContent})

      res.status(this.HTTP.CREATED).send({
        token: tokenDTO.content,
      })
    } catch (e) {
      next(e)
    }
  }

  async update(req, res, next) {
    try {
      must.be.object(req.userDTO)
      must.be.notEmptyString(req.tokenContent)

      if (Number(req.params?.id) !== req.userDTO.id) {
        throw new ForbiddenException('Cannot perform!')
      }

      let message = null

      this._validator.validateObj(req.body, {
        password: ['regex:/^[A-Za-z0-9!@#$%&*_\\-=+]{5,255}$/'],
        user: 'object-shape',
      }, errors => {
        message = errors.sum
      })

      if (message) {
        throw new ValidationException(message)
      }

      if (req.body.password) {
        await this._userService.updatePassword({userDTO: req.userDTO, password: req.body.password})
      }

      if (req.body.user) {
        await this._userService.updateData({userDTO: req.userDTO, userData: req.body.user})
      }

      res.status(this.HTTP.NO_CONTENT).send({})
    } catch (e) {
      next(e)
    }
  }

  async delete(req, res, next) {
    try {
      must.be.object(req.userDTO)
      must.be.notEmptyString(req.tokenContent)

      if (Number(req.params?.id) !== req.userDTO.id) {
        throw new ForbiddenException('Cannot perform!')
      }

      await this._userService.delete({userDTO: req.userDTO})

      res.status(this.HTTP.NO_CONTENT).send({})
    } catch (e) {
      next(e)
    }
  }
}

module.exports = AuthController