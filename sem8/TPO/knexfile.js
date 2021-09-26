const app = require('./bootstrap')

app
  .register({
    threadName: process.env.THREAD_NAME || null
  })
  .boot()
const migrationsManager = app.get('migrationsManager')
const knexConfig = migrationsManager.getMigrationConfig()
module.exports = knexConfig