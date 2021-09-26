const jwt = require('jsonwebtoken')
const {must} = toweran

class TokenService {
  /**
   * @DI app.domain.Auth.repositories.TokenDAO
   * @param {TokenDAO} tokenDAO
   */
  constructor(tokenDAO) {
    /**
     * @type {TokenDAO}
     * @protected
     */
    this._tokenDAO = tokenDAO

    this._secret = process.env.JWT_SECRET
    must.be.notEmptyString(this._secret)

    this._expTerm = Number(process.env.JWT_EXP_TERM)
    if (this._expTerm < 1) {
      throw new Error(`JWT expiration term is invalid!`)
    }
  }

  /**
   * @param {UserDTO} userDTO
   * @returns {Promise<TokenDTO>}
   */
  async create(userDTO) {
    must.be.object(userDTO)
    must.be.number(userDTO.id)

    const createdAt = new Date()

    const content = jwt.sign({
      sub: userDTO.id,
      iat: +createdAt,
      exp: +createdAt + this._expTerm,
    }, this._secret, {})

    return await this._tokenDAO.create({
      userId: userDTO.id,
      content,
      createdAt
    })
  }

  /**
   * @param {string} tokenContent
   * @returns {Promise<TokenDTO|null>}
   */
  async verify(tokenContent) {
    let payload = null

    try {
      payload = jwt.verify(tokenContent, this._secret, {ignoreExpiration: true})
    } catch (e) {
      return null
    }

    const tokenDTO = await this._tokenDAO.find(tokenContent)

    if (!tokenDTO) {
      return null
    }

    if (tokenDTO.userId !== payload.sub) {
      return null
    }

    if (this._isExpired(tokenDTO, payload)) {
      await this._tokenDAO.delete(tokenDTO)
      return null
    }

    return tokenDTO
  }

  /**
   * @param {TokenDTO} tokenDTO
   * @returns {Promise<void>}
   */
  async delete(tokenDTO) {

  }


  /**
   * @param {TokenDTO} tokenDTO
   * @returns {Promise<void>}
   */
  async deleteAllForUser(tokenDTO) {

  }

  /**
   * @param {TokenDTO} tokenDTO
   * @param {{exp: number}} payload
   * @returns {boolean}
   * @protected
   */
  _isExpired(tokenDTO, payload) {
    const now = Date.now()
    if (payload.exp < now) {
      return true
    }

    return (+tokenDTO.createdAt + this._expTerm) < now
  }

}

module.exports = TokenService