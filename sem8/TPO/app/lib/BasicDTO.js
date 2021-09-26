'use strict'


class BasicDTO {

  clone(initial = this.data()) {
    const newInstance = new this.constructor()

    const objectToSet = Object.keys(initial).reduce((data, key) => {

      switch (true) {
        case newInstance.hasOwnProperty(`_${key}`):
          data[key] = initial[key]
          break
        case newInstance.hasOwnProperty(`_${camelCase(key)}`):
          data[camelCase(key)] = initial[key]
          break
        case newInstance.hasOwnProperty(`_${snakeCase(key)}`):
          data[snakeCase(key)] = initial[key]
          break
      }

      return data

    }, {})

    return Object.assign(newInstance, objectToSet)
  }

  /**
   * Get data object
   * @param {?string} mode
   * @return {{}}
   */
  data(mode = null) {
    if (null !== mode && 'string' === typeof mode && !!this[`data${mode}`] && 'function' === typeof this[`data${mode}`]) {
      return (this[`data${mode}`])()
    }

    return Object.keys(this).reduce((data, key) => {
      if (0 !== key.indexOf('_')) {
        return data
      }

      data[key.slice(1)] = this[key]

      return data
    }, {})
  }

  dataSnakeCase() {
    const dataObject = this.data(null)

    return Object.keys(dataObject).reduce((scDataObject, key) => {
      const scKey = snakeCase(key)

      scDataObject[scKey] = dataObject[key]

      return scDataObject
    }, {})
  }
}

function snakeCase(s) {
  return s.replace(/(?:^|\.?)([A-Z])([a-z]+)/g, function (x, y, z) {
    return "_" + y.toLowerCase() + z
  }).replace(/^_/, "")
}


function camelCase(s) {
  return s.replace(/(?:^|\.?)(_)([a-z])/g, function (x, y, z) {
    return z.toUpperCase()
  })
}

module.exports = BasicDTO
