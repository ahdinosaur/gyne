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

  // return methods
  return {
    diff: withLogs({ log, method: 'diff' })(diff),
    patch: withLogs({ log, method: 'patch' })(patch)
  }

  function diff (rawConfig) {
    const futureCurrentSpec = StackResource(context)
      .list()
      .map(StackSpec.fromInspect)

    const futureNextSpec = getConfig(rawConfig)
      .chain(config =>
        Future((reject, resolve) => {
          console.log('config', config)
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
        console.log('current spec', currentSpec)
        console.log('next spec', nextSpec)
        const diff = diffSpecs(currentSpec, nextSpec)
        console.log('diff', JSON.stringify(diff, null, 2))
        // create
        // update
        // remove
        return diff
      }
    )
  }

  function patch (diff) {
    // patchResources(context)(diff)
  }
}

/*
function patchResources (context) {
  const patchNetworks = patchResource(Network(context))
  const patchServices = patchResource(Service(context))
  const patchVolumes = patchResource(Volume(context))

  return diff => {
    return Future.parallel(Infinity, [
      patchNetworks(diff.networks),
      patchServices(diff.services),
      patchVolumes(diff.volumes)
    ])
  }
}

function patchResource (resource) {
  return diff => {
    return Future.parallel(10, [
      ...map(resource.create, diff.create),
      ...map(resource.update, diff.update),
      ...map(resource.remove, diff.remove)
    ])
  }
}
*/
