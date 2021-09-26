const jwt = require('jsonwebtoken')

class UserService {
  /**
   * @DI app.domain.Auth.services.TokenService
   * @DI app.domain.Auth.repositories.UserDAO
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
  }

  /**
   * @param {string} login
   * @param {string} password
   * @param {*} userData
   * @returns {Promise<{tokenDTO: TokenDTO, userDTO: UserDTO}>}
   */
  async register({login, password, userData}) {

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
}

module.exports = UserService