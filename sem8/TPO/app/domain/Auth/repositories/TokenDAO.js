const {APP_PATH} = toweran
const ImportedBasicDAO = require(APP_PATH + '/app/lib/BasicDAO')
const {must} = toweran

/**
 * @extends BasicDAO
 */
class TokenDAO extends ImportedBasicDAO {
  /**
   * @DI dbConnection
   * @DI app.domain.Auth.entities.TokenDTO
   * @param {{function(): QueryBuilder}} dbConnection
   * @param {TokenDTO} tokenDTO
   */
  constructor(dbConnection, tokenDTO) {
    super(dbConnection(), 'tokens', tokenDTO)
  }

  /**
   * @param {number} userId
   * @param {string} content
   * @param {Date} createdAt
   * @returns {Promise<TokenDTO>}
   */
  async create({userId, content, createdAt}) {
    must.be.number(userId)
    must.be.notEmptyString(content)
    must.be.instance(createdAt, Date)

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
  async find({tokenContent}) {
    must.be.notEmptyString(tokenContent)

    const query = this._connection
      .select('*')
      .from(this._TABLE_NAME)
      .where({content: tokenContent})
      .orderBy('created_at', 'desc')
      .first()

    const result = await query
    if (!result) {
      return null
    }

    return this.makeDTO({...result})
  }

  /**
   * @param {TokenDTO} tokenDTO
   * @returns {Promise<void>}
   */
  async delete({tokenDTO}) {
    must.be.instance(tokenDTO, this._dto.constructor)

    const query = this._connection
      .delete()
      .from(this._TABLE_NAME)
      //.where({id: tokenDTO.id})
      // to make sure no dups left (dups are OK theoretically, but not after delete)
      .where({content: tokenDTO.content})

    await query
  }

  /**
   * @param {number} userId
   * @param {?Transaction} transaction
   * @returns {Promise<void>}
   */
  async deleteAllByUserId({userId, transaction = null}) {
    must.be.number(userId)

    const query = this._connection
      .delete()
      .from(this._TABLE_NAME)
      .where({user_id: userId})

    if(transaction) {
      query.transacting(transaction)
    }

    await query
  }
}

module.exports = TokenDAO