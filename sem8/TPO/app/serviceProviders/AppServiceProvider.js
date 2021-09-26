'use strict'

const {
  APP_PATH,
  BasicServiceProvider
} = toweran

/**
 * @property {ContainerInterface} _container
 */
class AppServiceProvider extends BasicServiceProvider {
  register() {
    this._container.register('validator', require(APP_PATH + '/app/lib/Validator'))
  }

  boot() {

  }
}

module.exports = AppServiceProvider