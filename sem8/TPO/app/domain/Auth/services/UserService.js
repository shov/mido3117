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

  }

  /**
   * @param {string} tokenContent
   * @returns {Promise<void>}
   */
  async logout({tokenContent}) {

  }

  /**
   * @param {string} tokenContent
   * @returns {Promise<UserDTO>}
   */
  async verify({tokenContent}) {
    const tokenDTO = await this._tokenService.verify(tokenContent)
    if(!tokenDTO) {
      throw new UnauthorizedException('Invalid token!')
    }

    const userDTO = await this._userDAO.find({id: tokenDTO.userId})
    if(!userDTO) {
      throw new UnauthorizedException('Invalid token!')
    }

    return userDTO
  }

  /**
   * @param {string}  tokenContent
   * @returns {Promise<TokenDTO>}
   */
  async refresh({tokenContent}) {

  }

  /**
   * @param {UserDTO} userDTO
   * @param {string} password
   * @returns {Promise<void>}
   */
  async updatePassword({userDTO, password}) {

  }

  /**
   * @param {UserDTO} userDTO
   * @param {string} userData
   * @returns {Promise<void>}
   */
  async updateData({userDTO, userData}) {

  }

  /**
   * @param {UserDTO} userDTO
   * @returns {Promise<void>}
   */
  async delete({userDTO}) {

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