const { assign, isNil } = require('lodash')
const step = require('callstep')

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
      return step.series([
        step.sync(() => log.debug(`stack:up`, { rawConfig })),
        step.waterfall([
          getConfig(rawConfig),
          config => {
            console.log('config', config)
            const {
              networks,
              stacks,
              services,
              volumes
            } = targetChildResources(context, config, 'up')
            return step.series([
              step.parallel([...networks, ...volumes]),
              step.parallel([...services, ...stacks])
            ])
          }
        ])
      ])
    },
    down (rawConfig) {
      return step.series([
        step.sync(() => log.debug(`stack:down`, { rawConfig })),
        step.waterfall([
          getConfig(rawConfig),
          config => {
            const {
              networks,
              stacks,
              services,
              volumes
            } = targetChildResources(context, config, 'down')
            return step.series([
              step.parallel([...networks, ...volumes]),
              step.parallel([...services, ...stacks])
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
