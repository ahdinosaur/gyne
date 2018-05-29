const Future = require('fluture')

const withLogs = require('./util/withLogs')
const createValidationError = require('./util/createValidationError')

const createContext = require('./context/create')
const validateContext = require('./context/validate')
const diffSpecs = require('./specs/util/diff')
const getConfig = require('./configs/util/get')

const StackSpec = require('./specs/stack')
const StackConfig = require('./configs/stack')
const StackResource = require('./resources/stack')

module.exports = Gyne

function Gyne (context = {}) {
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

  // returns Future<Diff>
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

  // returns Future<?>
  function patch (diff) {
    return stackResource.patch(diff)
  }
}
