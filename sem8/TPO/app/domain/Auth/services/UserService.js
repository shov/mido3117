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

  async register() {

  }

  async login() {

  }

  async logout() {

  }

  async verify() {

  }

  async refresh() {

  }

  async updatePassword() {

  }

  async updateData() {

  }

  async delete() {

  }
}

module.exports = UserService