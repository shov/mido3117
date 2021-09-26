const {APP_PATH} = toweran
const ImportedBasicDAO = require(APP_PATH + '/app/lib/BasicDAO')
const {must} = toweran

/**
 * @extends BasicDAO
 */
class UserDAO extends ImportedBasicDAO {
  /**
   * @DI dbConnection
   * @DI app.domain.Auth.entities.UserDTO
   * @param {function(): QueryBuilder} dbConnection
   * @param {UserDTO} userDTO
   */
  constructor(dbConnection, userDTO) {
    super(dbConnection(), 'users', userDTO)
  }

  /**
   * @param {string} login
   * @param {string} hash
   * @param  {*} details
   * @returns {Promise<UserDTO>}
   */
  async create({login, hash, details}) {
    must.be.notEmptyString(login)
    must.be.notEmptyString(hash)
    must.be.object(details)

    const createdAt = new Date()

    const userDTO = this.makeDTO({
      login, hash, details, createdAt
    })

    const query = this._connection(this._TABLE_NAME)
      .insert(userDTO.dataDB())
      .returning('id')

    const result = await query
    userDTO.id = result[0]

    return userDTO
  }

  /**
   * @param {string} login
   * @returns {Promise<UserDTO|null>}
   */
  async findByLogin({login}) {
    must.be.notEmptyString(login)
    const query = this._connection
      .select('*')
      .from(this._TABLE_NAME)
      .where({login})
      .first()

    const result = await query
    if (!result) {
      return null
    }

    return this.makeDTO({...result})
  }

  /**
   * @param {number} id
   * @returns {Promise<UserDTO|null>}
   */
  async find({id}) {
    must.be.number(id)
    const query = this._connection
      .select('*')
      .from(this._TABLE_NAME)
      .where({id})
      .first()

    const result = await query
    if (!result) {
      return null
    }

    return this.makeDTO({...result})
  }

  /**
   * @param {UserDTO} userDTO
   * @returns {Promise<void>}
   */
  async update({userDTO}) {
    const query = this._connection(this._TABLE_NAME)
      .update(userDTO.dataDB())
      .where({id: userDTO.id})

    await query
  }

  /**
   * @param {UserDTO} userDTO
   * @param {?Transaction} transaction
   * @returns {Promise<void>}
   */
  async delete({userDTO, transaction = null}) {
    const query = this._connection
      .delete()
      .from(this._TABLE_NAME)
      .where({id: userDTO.id})

    if (transaction) {
      query.transacting(transaction)
    }

    await query
  }
}

module.exports = UserDAO