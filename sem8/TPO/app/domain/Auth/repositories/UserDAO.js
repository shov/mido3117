const {APP_PATH} = toweran
const ImportedBasicDAO = require(APP_PATH + '/app/lib/BasicDAO')

/**
 * @extends BasicDAO
 */
class UserDAO extends ImportedBasicDAO {
  /**
   * @DI dbConnection
   * @DI app.domain.Auth.entities.UserDTO
   * @param {QueryBuilder} dbConnection
   * @param {UserDTO} userDTO
   */
  constructor(dbConnection, userDTO) {
    super(dbConnection, 'tokens', userDTO)
  }

  /**
   * @param {string} login
   * @param {string} hash
   * @param  {*} details
   * @returns {Promise<UserDTO>}
   */
  async create({login, hash, details}) {
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
  async findByLogin(login) {

  }
}

module.exports = UserDAO