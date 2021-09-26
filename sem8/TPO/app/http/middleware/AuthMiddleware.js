'use strict'

const ImportedBasicMiddleware = toweran.BasicMiddleware
const {UnauthorizedException} = toweran
const check = require('check-types')

/**
 * @extends BasicMiddleware
 */
class AuthMiddleware extends ImportedBasicMiddleware {
  /**
   * @DI app.domain.Auth.services.UserService
   * @param {UserService} userService
   */
  constructor(userService) {
    super()

    /**
     * @type {UserService}
     * @private
     */
    this._userServcie = userService
  }

  async handle(req, res, next) {
    const authHeader = req.headers['authorization'] || null

    if (!authHeader
      || !check.nonEmptyString(authHeader)
      || !/^Bearer\s[^\s]+$/.test(authHeader.trim())) {
      throw new UnauthorizedException('No token found')
    }

    const tokenContent = authHeader.trim().split(' ')[1]
    req.userDTO = await this._userServcie.verify({tokenContent})
    req.tokenContent = tokenContent
    next()
  }
}

module.exports = AuthMiddleware