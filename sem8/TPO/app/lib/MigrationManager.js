const knex = require('knex')
const {
  APP_PATH
} = toweran

class MigrationsManager {
  constructor(logger, config, dbConnectionProvider) {
    this._logger = logger
    const creds = dbConnectionProvider.getConnectionConfig()

    if (!creds.migrations) {
      creds.migrations = {}
    }

    if (!creds.migrations.tableName) {
      creds.migrations.tableName = 'migrations'
    }

    if (!creds.migrations.directory) {
      creds.migrations.directory = APP_PATH + '/database/migrations'
    }
    /**
     * {{}}
     * @private
     */
    this._migrationsConfig = creds
    /**
     * It`s update with defaults if config creds contain on everything
     * @type {QueryInterface}
     * @private
     */
    this._dbConnection = knex(creds)
  }

  getMigrationConfig() {
    return this._migrationsConfig
  }

  async refresh() {
    if (process.env.NODE_ENV !== 'testing') {
      throw new Error('Refreshing is for testing now!')
    }

    await this._dbConnection.migrate.rollback(null, true)
    await this._dbConnection.migrate.latest()
  }
}

module.exports = MigrationsManager