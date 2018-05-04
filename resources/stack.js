const { assign, isNil } = require('lodash')

const async = require('../util/async')
const Network = require('./network')
const Volume = require('./volume')
const Service = require('./service')
const { Context } = require('../defaults')
const getConfig = require('../util/getConfig')

module.exports = Stack

function Stack (context = {}) {
  context = Context(context)

  const { log } = context

  return {
    up (rawConfig) {
      return async.series([
        async.sync(() => log.debug(`stack:up`, { rawConfig })),
        async.waterfall([
          getConfig(rawConfig),
          config => {
            const {
              networks,
              stacks,
              services,
              volumes
            } = targetChildResources(context, config, 'up')
            return async.series([
              async.parallel([...networks, ...volumes]),
              async.parallel([...services, ...stacks])
            ])
          }
        ])
      ])
    },
    down (rawConfig) {
      return async.series([
        async.sync(() => log.debug(`stack:down`, { rawConfig })),
        async.waterfall([
          getConfig(rawConfig),
          config => {
            const {
              networks,
              stacks,
              services,
              volumes
            } = targetChildResources(context, config, 'down')
            return async.series([
              async.parallel([...networks, ...volumes]),
              async.parallel([...services, ...stacks])
            ])
          }
        ])
      ])
    }
  }
}

function targetChildResources (context, config = {}, command) {
  const { Name: name } = config

  if (isNil(context.namespace)) {
    context.namespace = name ? [name] : []
  }

  var {
    Networks: networks = [],
    Stacks: stacks = [],
    Services: services = [],
    Volumes: volumes = []
  } = config

  networks = networks.map(network => {
    return Network(context)[command](network)
  })
  volumes = volumes.map(volume => {
    return Volume(context)[command](volume)
  })
  services = services.map(service => {
    return Service(context)[command](service)
  })

  stacks = stacks.map(stack => {
    const { Name: name } = stack
    const namespace = [...context.namespace, name]
    const nextContext = assign({}, context, { namespace })
    return Stack(nextContext)[command](stack)
  })

  return {
    networks,
    stacks,
    services,
    volumes
  }
}
