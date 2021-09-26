'use strict'

const {must} = toweran

class BasicDAO {
  /**
   * @param {{}|*|QueryInterface} connection
   * @param {string} tableName
   * @param {null|BasicDTO} dto
   */
  constructor(connection, tableName, dto) {

    if(null === connection) {
      throw new Error(`Wrong connection, null given`)
    }

    must.be.notEmptyString(tableName)

    /**
     * @type {{}|*|QueryInterface}
     * @protected
     */
    this._connection = connection

    /**
     * @type {string}
     * @protected
     */
    this._TABLE_NAME = tableName

    /**
     * @type {null|BasicDTO}
     * @protected
     */
    this._dto = dto || null
  }

  makeDTO(data = {}) {
    if(!this._dto) {
      throw new Error(`Cannot make a DTO, not set!`)
    }

    return this._dto.clone(data)
  }
}

module.exports = BasicDAO