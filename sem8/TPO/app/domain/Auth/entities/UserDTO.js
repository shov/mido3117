const {APP_PATH} = toweran
const ImportedBasicDTO = require(APP_PATH + '/app/lib/BasicDTO')

/**
 * @extends BasicDTO
 */
class UserDTO extends ImportedBasicDTO {
  get id() {
    return this._id ? Number(this._id) : this._id
  }

  set id(value) {
    this._id = value
  }

  get login() {
    return this._login
  }

  set login(value) {
    this._login = value
  }

  get hash() {
    return this._hash
  }

  set hash(value) {
    this._hash = value
  }

  get details() {
    return this._details
  }

  set details(value) {
    this._details = value
  }

  get createdAt() {
    return this._createdAt
  }

  set createdAt(value) {
    this._createdAt = value
  }

  constructor() {
    super()
    this._id = null
    this._login = null
    this._hash = null
    this._details = null
    this._createdAt = null
  }

  /**
   * @param {*} data
   * @returns {UserDTO}
   */
  clone(data = {}) {
    return super.clone(data)
  }

  dataDB() {
    const data = this.dataSnakeCase()
    delete data.id

    return data
  }
}

module.exports = UserDTO