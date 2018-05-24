const Future = require('fluture')
const { map } = require('ramda')

const createValidationError = require('./util/createValidationError')
const diffConfigs = require('./config/diff')
const Config = require('./config')

const Network = require('./resources/network')
const Service = require('./resources/service')
const Volume = require('./resources/volume')

const { Context } = require('./defaults')
const getConfig = require('./util/getConfig')
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
    diff: withLogs({ log, method: 'diff' })(diff),
    patch: withLogs({ log, method: 'patch' })(patch)
  }

  function diff (rawConfig) {
    return Future.parallel(Infinity, [
      listAllResources(context),
      getConfig(rawConfig).map(Config)
    ]).map(([currentConfig, nextConfig]) => {
      console.log('currentConfig', currentConfig)
      console.log('nextConfig', nextConfig)
      const diff = diffConfigs(currentConfig, nextConfig)
      console.log('diff', JSON.stringify(diff, null, 2))
      // create
      // update
      // remove
      return diff
    })
  }

  function patch (config) {
    return Future.of()
  }
}

const { complement, evolve, filter } = require('ramda')
const pickFields = require('./util/pickFields')
const NetworkConfig = require('./config/network')
const ServiceConfig = require('./config/service')
const VolumeConfig = require('./config/volume')

function listAllResources (context) {
  return Future.parallel(Infinity, [
    Network(context).list(),
    Service(context).list(),
    Volume(context).list()
  ])
    .map(([networks, services, volumes]) => ({
      networks,
      services,
      volumes
    }))
    .map(
      evolve({
        networks: filter(complement(isDefaultNetwork))
      })
    )
    .map(
      evolve({
        networks: map(pickFields(NetworkConfig.fields)),
        services: map(pickFields(ServiceConfig.fields)),
        volumes: map(pickFields(VolumeConfig.fields))
      })
    )
}

function isDefaultNetwork (network) {
  const { Name } = network
  return (
    Name === 'ingress' ||
    Name === 'bridge' ||
    Name === 'none' ||
    Name === 'docker_gwbridge' ||
    Name === 'host'
  )
}
