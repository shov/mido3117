'use strict'
/**
 * Server application
 * - host the frontend html
 * - host the script used on the frontend
 * - response with 404 for all the rest of requests
 * - HTTP support only
 */

const http = require('http')
const {URL} = require('url')

class Server {
  constructor() {
    /**
     * @const
     * @type {number}
     */
    this.PORT = 3000

    /**
     * Routes handlers
     * @type {{}}
     * @private
     */
    this._routes = require('./routes')
  }

  /**
   * Initialization, starting the server
   */
  init() {
    const server = http.createServer(this.requestHandler.bind(this))

    server.listen(this.PORT, () => {
      console.info(`Server is listening on port ${this.PORT}`)
    })

    server.on('error', e => {
      console.error(`Server fall!`, e, e.stack)
      server.close()
      process.exit(1)
    })
  }

  /**
   * Handle incoming requests
   * @param {{}} req
   * @param {{}} res
   * @return {Promise<void>}
   */
  async requestHandler(req, res) {
    //Collecting req data
    const url = new URL(req.url, `http://${req.headers.host}`)
    const requestedPath = url.pathname.replace(/^(.+)\/$/, '$1')
    const method = req.method.toUpperCase()

    console.info(`Incoming request ${method} ${requestedPath}`)

    const handlerName = `${method}:${requestedPath}`

    if ('function' !== typeof this._routes[handlerName]) {
      return this.response(res, 404)
    }

    let responseData
    try {
      responseData = await this._routes[handlerName]()
    } catch (e) {
      return this.response(res, 500, 'Cannot process the request!')
    }

    return this.response(res, responseData.statusCode, responseData.body, responseData.headers)
  }

  /**
   * Send a response
   * @param {{}} res
   * @param {number} statusCode
   * @param {null|string} body
   * @param {[]} headers
   */
  response(res, statusCode, body = null, headers = []) {
    if ('number' !== typeof statusCode) {
      console.error(`Handler called with a not number status code!`)
      res.writeHead(500)
      res.end('Cannot response correctly!')
      return
    }

    headers.forEach(curHeader => {
      res.setHeader(curHeader.name, curHeader.value)
    })

    res.writeHead(statusCode)

    if ('string' === typeof body) {
      res.end(body)
      return
    }

    res.end()
  }

}

// Initialization
new Server().init()
