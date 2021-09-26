'use strict'

const ImportedBasicController = toweran.BasicController
const {ValidationException} = toweran

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
      res.status(this.HTTP.OK).send({})
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      res.status(this.HTTP.OK).send({})
    } catch (e) {
      next(e)
    }
  }

  async verify(req, res, next) {
    try {
      res.status(this.HTTP.OK).send({})
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      res.status(this.HTTP.OK).send({})
    } catch (e) {
      next(e)
    }
  }

  async update(req, res, next) {
    try {
      res.status(this.HTTP.OK).send({})
    } catch (e) {
      next(e)
    }
  }

  async delete(req, res, next) {
    try {
      res.status(this.HTTP.OK).send({})
    } catch (e) {
      next(e)
    }
  }
}

module.exports = AuthController