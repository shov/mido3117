'use strict'

const {
  FRAMEWORK_PATH,
  APP_PATH,
  BasicServiceProvider
} = toweran


const knex = require('knex')

/**
 * @property {ContainerInterface} _container
 */
class DataBaseServiceProvider extends BasicServiceProvider {
  register() {
  const container = this._container

    container
      .instance('dbConnectionProvider', {
        _mainConnection: null,
        _creds: null,

        getConnection() {
          if (this._mainConnection) {
            return this._mainConnection;
          }

          if (!this._creds) {
            this._fillCreds();
          }

          this._mainConnection = knex(this._creds);
          return this._mainConnection;
        },

        getConnectionConfig() {
          if (this._creds) {
            return this._creds;
          }

          this._fillCreds();
          return this._creds;
        },

        _fillCreds() {
          const config = container.get('config');

          if (!config.db.getCredentials()) {
            throw new Error('Cannot find db config!');
          }

          const creds = config.db.getCredentials()();
          if (!creds) {
            throw new Error('Cannot get creds from db config!');
          }

          this._creds = creds;
        },
      })

    container
      .instance('dbConnection', () => {
        return container.get('dbConnectionProvider').getConnection();
      })

    container
      .register('migrationManager', require(APP_PATH + '/app/lib/MigrationManager'))
      .dependencies('logger', 'config', 'dbConnectionProvider');

  }

  boot() {

  }
}

module.exports = DataBaseServiceProvider