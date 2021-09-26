'use strict'

const ValidationEngine = require('validatorjs')
const check = require('check-types')

/**
 * Provide with validation
 */
class Validator {
  constructor() {
    ValidationEngine.register('bool-strict', function (value, requirement, attribute) {
      return 'boolean' === typeof value
    }, ':attribute must be true or false')

    ValidationEngine.register('object-shape', function(value, requirement, attribute) {
      return check.object(value);
    }, ':attribute must be an object');
  }

  /**
   * @param {{}} obj
   * @param {{}} rules
   * @param {?function} failHandler
   * @return {boolean}
   */
  validateObj(obj, rules, failHandler = null) {
    const v = new ValidationEngine(obj, rules)
    const result = v.passes()

    if (!result && 'function' === typeof failHandler) {
      const errors = v.errors.all()
      errors.sum = Object.values(errors)
        .reduce((s, a) => {
          return s + (s.length > 0 ? ' ' : '') + a[0]
        }, '')

      failHandler(errors)
    }

    return result
  }
}

module.exports = Validator
