const Future = require('fluture')

const withLogs = require('./util/withLogs')
const createValidationError = require('./util/createValidationError')

const diffSpecs = require('./spec/diff')
const getConfig = require('./config/get')
const StackSpec = require('./stack/spec')
const StackConfig = require('./stack/config')
const StackResource = require('./stack/resource')
const createContext = require('./context/create')
const validateContext = require('./context/validate')

module.exports = Dock

// returns Result<Diff>
function Dock (context = {}) {
  // validate context
  validateContext(context).matchWith({
    Failure: ({ value }) => {
      throw createValidationError(value)
    },
    Success: ({ value }) => {
      context = createContext(value)
    }
  })

  const { log } = context
  const stackResource = StackResource(context)

  // return methods
  return {
    diff: withLogs({ log, method: 'diff' })(diff),
    patch: withLogs({ log, method: 'patch' })(patch)
  }

  function diff (rawConfig) {
    const futureCurrentSpec = stackResource.list().map(StackSpec.fromInspect)

    const futureNextSpec = getConfig(rawConfig)
      .chain(config =>
        Future((reject, resolve) => {
          StackConfig.validate(config).matchWith({
            Failure: ({ value }) => {
              reject(createValidationError(value))
            },
            Success: ({ value }) => resolve(value)
          })
        })
      )
      .map(StackSpec.fromConfig)

    return Future.parallel(Infinity, [futureCurrentSpec, futureNextSpec]).map(
      ([currentSpec, nextSpec]) => {
        return diffSpecs(currentSpec, nextSpec)
      }
    )
  }

  function patch (diff) {
    return stackResource.patch(diff)
  }
}
