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
    const futureCurrentSpec = stackResource.list()

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
      ([currentRawSpec, nextSpec]) => {
        // TODO where should this happen?
        fixNetworkIds(currentRawSpec, nextSpec)

        const currentSpec = StackSpec.fromInspect(currentRawSpec)

        log.info('Ready to diff specs', {
          current: currentSpec,
          next: nextSpec
        })

        return diffSpecs(currentSpec, nextSpec)
      }
    )
  }

  // returns Future<?>
  function patch (diff) {
    return stackResource.patch(diff)
  }
}

const { indexBy, prop } = require('ramda')

const indexByName = indexBy(prop('Name'))

function fixNetworkIds (currentSpec, nextSpec) {
  // TODO clean up
  // change next service networks to use ids as current
  const networksByName = indexByName(currentSpec.networks)
  nextSpec.services.forEach(service => {
    if (service.Networks) {
      service.Networks.forEach(network => {
        const currentNetwork = networksByName[network.Target]
        if (currentNetwork) {
          network.Target = currentNetwork.Id
        }
      })
    }
  })
}
