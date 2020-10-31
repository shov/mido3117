'use strict'

const path = require('path')
const fs = require('fs')

/**
 * routes handlers
 * @type {{}}
 */
const routes = {
  'GET:/': async () => {
    const staticFilePath = path.join(__dirname, './index.html')
    const body = fs.readFileSync(staticFilePath).toString('utf8')

    return {
      statusCode: 200,
      body,
      headers: [{
        name: 'Content-Type',
        value: 'text/html; charset=UTF-8',
      }]
    }
  },

  'GET:/frontScript.js': async () => {
    const staticFilePath = path.join(__dirname, './frontScript.js')
    const body = fs.readFileSync(staticFilePath).toString('utf8')

    return {
      statusCode: 200,
      body,
      headers: [{
        name: 'Content-Type',
        value: 'application/javascript',
      }]
    }
  }
}

module.exports = routes
