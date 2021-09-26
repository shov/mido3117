class TokenDAOMock {
  constructor(methods, tokenDTO) {
    Object.entries(methods).forEach(([name, cb]) => {
      this[name] = cb
    })
    this._dto = tokenDTO
  }

  makeDTO(data) {
    return this._dto.clone(data)
  }
}

module.exports = TokenDAOMock