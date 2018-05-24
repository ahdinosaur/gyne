const Future = require('fluture')
const { compose, map } = require('ramda')

const createValidationError = require('./util/createValidationError')
const Config = require('./config')

const Network = require('./resources/network')
const Service = require('./resources/service')
const Volume = require('./resources/volume')

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
    listAllResources(context).value(resources => {
      console.log('resources', resources)
    })

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

const { evolve } = require('ramda')
const pickFields = require('./util/pickFields')
const NetworkConfig = require('./config/network')
const ServiceConfig = require('./config/service')
const VolumeConfig = require('./config/volume')

const { tap } = require('ramda')

function listAllResources (context) {
  return (
    Future.parallel(Infinity, [
      Network(context).list(),
      Service(context).list(),
      Volume(context).list()
    ])
      .map(([networks, services, volumes]) => ({
        networks,
        services,
        volumes
      }))
      // .map(tap(console.log.bind(console, 'heyheyhey')))
      .map(
        evolve({
          networks: map(pickFields(NetworkConfig.fields)),
          services: map(pickFields(ServiceConfig.fields)),
          volumes: map(pickFields(VolumeConfig.fields))
        })
      )
      .map(tap(console.log.bind(console, 'heyheyhey')))
  )
}
