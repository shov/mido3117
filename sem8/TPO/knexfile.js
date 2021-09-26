const app = require('./bootstrap')

app
  .register({
    threadName: process.env.THREAD_NAME || null
  })
  .boot()
const migrationManager = app.get('migrationManager')
const knexConfig = migrationManager.getMigrationConfig()
module.exports = knexConfig