const {APP_PATH} = toweran
const ImportedBasicDAO = require(APP_PATH + '/app/lib/BasicDAO')

/**
 * @extends BasicDAO
 */
class TokenDAO extends ImportedBasicDAO {
  /**
   * @DI dbConnection
   * @DI app.domain.Auth.entities.TokenDTO
   * @param {QueryBuilder} dbConnection
   * @param {TokenDTO} tokenDTO
   */
  constructor(dbConnection, tokenDTO) {
    super(dbConnection, 'tokens', tokenDTO)
  }

  /**
   * @param {number} userId
   * @param {string} content
   * @param {Date} createdAt
   * @returns {Promise<TokenDTO>}
   */
  async create({userId, content, createdAt}) {

    const tokenDTO = this.makeDTO({
     userId, content, createdAt
    })

    const query = this._connection(this._TABLE_NAME)
      .insert(tokenDTO.dataDB())
      .returning('id')

    const result = await query
    tokenDTO.id = result[0]

    return tokenDTO
  }

  /**
   * @param {string} tokenContent
   * @returns {Promise<TokenDTO|null>}
   */
  async find(tokenContent) {

  }

  /**
   * @param {TokenDTO} tokenDTO
   * @returns {Promise<void>}
   */
  async delete(tokenDTO) {

  }

  /**
   * @param {number} userId
   * @returns {Promise<void>}
   */
  async deleteAllByUserId(userId) {

  }
}

module.exports = TokenDAO