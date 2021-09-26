class TokenDAOMock {
  constructor(create, tokenDTO) {
    this.create = create
    this._dto = tokenDTO
  }

  makeDTO(data) {
    return this._dto.clone(data)
  }
}

module.exports = TokenDAOMock