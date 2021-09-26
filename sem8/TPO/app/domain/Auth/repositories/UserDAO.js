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
   * @returns {Promise<UserDTO|null>}
   */
  async findByLogin(login) {

  }
}

module.exports = UserDAO