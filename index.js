const Future = require('fluture')
const Validation = require('folktale/validation')
const {
  isFailure,
  defaultRenderers: { failureRenderer }
} = require('folktale-validations')
const { compose } = require('ramda')

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

  function up (configValidation) {
    if (isFailure(configValidation)) {
      return Future.reject(createValidationError(configValidation.value))
    }
    const config = configValidation.value
    console.log('up config', config)
    return Future.of()
  }

  function down (configValidation) {
    if (Validation.Failure.hasInstance(configValidation)) {
      return Future.reject(createValidationError(configValidation))
    }
    const config = configValidation.value
    console.log('down config', config)
    return Future.of()
  }
}

function wrapMethod ({ log, method }) {
  return compose(withConfig({ log }), withLogs({ log, method }))
}

function createValidationError (value) {
  const message = failureRenderer(value)
  return new Error(message)
}
