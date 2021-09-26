const crypto = require('crypto')
const {must, BadRequestException, UnauthorizedException} = toweran

class UserService {
  /**
   * @DI app.domain.Auth.repositories.UserDAO
   * @DI app.domain.Auth.services.TokenService
   * @param {UserDAO} userDAO
   * @param {TokenService} tokenService
   */
  constructor(userDAO, tokenService) {
    /**
     * @type {UserDAO}
     * @protected
     */
    this._userDAO = userDAO

    /**
     * @type {TokenService}
     * @protected
     */
    this._tokenService = tokenService

    this._passwordSalt = process.env.PASSWORD_SALT
    must.be.notEmptyString(this._passwordSalt)
  }

  /**
   * @param {string} login
   * @param {string} password
   * @param {*} userData
   * @returns {Promise<{tokenDTO: TokenDTO, userDTO: UserDTO}>}
   */
  async register({login, password, userData}) {
    const hash = this._hashPassword(password)

    try {
      const userDTO = await this._userDAO.create({login, hash, details: userData})
      const tokenDTO = await this._tokenService.create(userDTO)

      return {userDTO, tokenDTO}

    } catch (e) {
      if (/duplica/.test(e?.message || '')) {
        throw new BadRequestException('Cannot register!')
      }

      throw e
    }
  }

  /**
   * @param {string} login
   * @param {string} password
   * @returns {Promise<TokenDTO>}
   */
  async login({login, password}) {
    must.be.notEmptyString(login)
    must.be.notEmptyString(password)
    const hash = this._hashPassword(password)
    const userDTO = await this._userDAO.findByLogin({login})
    if (!userDTO) {
      throw new BadRequestException('Cannot login!')
    }

    if (userDTO.hash !== hash) {
      throw new BadRequestException('Cannot login!')
    }

    return await this._tokenService.create(userDTO)
  }

  /**
   * @param {string} tokenContent
   * @returns {Promise<void>}
   */
  async logout({tokenContent}) {
    const tokenDTO = await this._tokenService.verify(tokenContent)
    if (!tokenDTO) {
      throw new UnauthorizedException('Token unexpectedly got invalid!')
    }
    await this._tokenService.delete(tokenDTO)
  }

  /**
   * @param {string} tokenContent
   * @returns {Promise<UserDTO>}
   */
  async verify({tokenContent}) {
    const tokenDTO = await this._tokenService.verify(tokenContent)
    if (!tokenDTO) {
      throw new UnauthorizedException('Invalid token!')
    }

    const userDTO = await this._userDAO.find({id: tokenDTO.userId})
    if (!userDTO) {
      throw new UnauthorizedException('Invalid token!')
    }

    return userDTO
  }

  /**
   * @param {string}  tokenContent
   * @returns {Promise<TokenDTO>}
   */
  async refresh({tokenContent}) {
    const userDTO = await this.verify({tokenContent})
    const oldTokenDTO = await this._tokenService.verify(tokenContent)
    if (!oldTokenDTO) {
      throw new UnauthorizedException('Invalid token!')
    }
    const newTokenDTO = await this._tokenService.create(userDTO)
    await this._tokenService.delete(oldTokenDTO)
    return newTokenDTO
  }

  /**
   * @param {UserDTO} userDTO
   * @param {string} password
   * @returns {Promise<void>}
   */
  async updatePassword({userDTO, password}) {
    must.be.instance(userDTO, this._userDAO.makeDTO().constructor)
    must.be.notEmptyString(password)
    userDTO.hash = this._hashPassword(password)
    await this._userDAO.update({userDTO})
  }

  /**
   * @param {UserDTO} userDTO
   * @param {*} userData
   * @returns {Promise<void>}
   */
  async updateData({userDTO, userData}) {
    must.be.instance(userDTO, this._userDAO.makeDTO().constructor)
    must.be.object(userData)
    userDTO.details = Object.assign({}, userData)
    await this._userDAO.update({userDTO})
  }

  /**
   * @param {UserDTO} userDTO
   * @returns {Promise<void>}
   */
  async delete({userDTO}) {
    must.be.instance(userDTO, this._userDAO.makeDTO().constructor)
    await this._userDAO.getConnection().transaction(async transaction => {
      await this._tokenService.deleteAllForUser({userId: userDTO.id, transaction})
      await this._userDAO.delete({userDTO, transaction})
    })
  }

  /**
   * @param {string} password
   * @return {string}
   * @private
   */
  _hashPassword(password) {
    return crypto.createHmac('sha256', this._passwordSalt)
      .update(password)
      .digest('hex')
  }
}

module.exports = UserService