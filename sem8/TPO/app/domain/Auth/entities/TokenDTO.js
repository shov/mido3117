const {APP_PATH} = toweran
const ImportedBasicDTO = require(APP_PATH + '/app/lib/BasicDTO')

/**
 * @extends BasicDTO
 */
class TokenDTO extends ImportedBasicDTO {
  get id() {
    return this._id ? Number(this._id) : this._id
  }

  set id(value) {
    this._id = value
  }

  get userId() {
    return this._userId
  }

  set userId(value) {
    this._userId = value
  }

  get content() {
    return this._content
  }

  set content(value) {
    this._content = value
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
    this._userId = null
    this._content = null
    this._createdAt = null
  }

  /**
   * @param {*} data
   * @returns {TokenDTO}
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

module.exports = TokenDTO