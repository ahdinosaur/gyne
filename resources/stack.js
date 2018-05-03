const { Context } = require('../defaults')

module.exports = Stack

function Stack (config = {}, context = {}) {
  context = Context(context)

  const { log } = context

  return {
    up: cb => {
      log.debug('stack:up', { config })
      cb()
    },
    down: cb => {
      log.debug('stack:down', { config })
      cb()
    }
  }
}
