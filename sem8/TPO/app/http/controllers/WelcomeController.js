'use strict'

const {
  BasicController,
} = toweran

class WelcomeController extends BasicController {
  greetings(req, res, next) {
    res.send({
      message: `Check the documentations for routes`
    })
  }
}

module.exports = WelcomeController