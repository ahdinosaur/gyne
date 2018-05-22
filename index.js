const Future = require('fluture')
const { compose } = require('ramda')

const createValidationError = require('./util/createValidationError')
const Config = require('./config')

/*
const Network = require('./resources/network')
const Service = require('./resources/service')
const Stack = require('./resources/stack')
const Volume = require('./resources/volume')
*/

const { Context } = require('./defaults')
const withConfig = require('./util/withConfig')
const withLogs = require('./util/withLogs')
const validateContext = require('./validators/context')

module.exports = Dock
/*
  default: Stack,
  Network,
  Service,
  Stack,
  Volume
*/

// returns Result<Diff>
function Dock (context = {}) {
  // validate context
  validateContext(context).matchWith({
    Failure: ({ value }) => {
      throw createValidationError(value)
    },
    Success: ({ value }) => {
      context = Context(value)
    }
  })

  const { log } = context

  // return methods
  return {
    up: wrapMethod({ log, method: 'up' })(up),
    down: wrapMethod({ log, method: 'down' })(down)
  }

  function up (config) {
    console.log('up config', config)
    console.log('whhatttt config', JSON.stringify(Config(config), null, 2))
    return Future.of()
  }

  function down (config) {
    console.log('down config', config)
    return Future.of()
  }
}

function wrapMethod ({ log, method }) {
  return compose(withConfig({ log }), withLogs({ log, method }))
}
