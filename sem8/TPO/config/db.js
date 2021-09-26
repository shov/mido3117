'use strict'

const check = require('check-types')

/**
 * DB configuration
 */
module.exports = {
  getCredentials() {
    const credsKeeper = {
      default: {
        client: 'pg',
        connection: {
          host: process.env.DB_HOST,
          post: process.env.DB_PORT || 5432,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          ssl: process.env.DB_SSL === 'true',
        },
        migrations: {
          tableName: 'migrations',
        },
      },
      testing: {
        client: 'pg',
        connection: {
          host: process.env.TEST_DB_HOST,
          post: process.env.TEST_DB_PORT || 5432,
          user: process.env.TEST_DB_USER,
          password: process.env.TEST_DB_PASSWORD,
          database: process.env.TEST_DB_NAME,
          ssl: process.env.TEST_DB_SSL === 'true',
        },
        migrations: {
          tableName: 'migrations',
        },
      },
    }
    if (check.object(credsKeeper[process.env.NODE_ENV])) {
      return credsKeeper[process.env.NODE_ENV]
    }
    return credsKeeper.default
  }
}