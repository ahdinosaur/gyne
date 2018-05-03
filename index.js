const { property } = require('lodash')

const async = require('./util/async')
const Network = require('./resources/network')
const Volume = require('./resources/volume')
const Service = require('./resources/service')
const Stack = require('./resources/stack')
const { Context } = require('./defaults')

module.exports = {
  default: System,
  Network,
  Service,
  Stack,
  System,
  Volume
}

function System (config = {}, context = {}) {
  context = Context(context)

  var { networks = [], stacks = [], services = [], volumes = [] } = config

  networks = networks.map(network => {
    return Network(network, context)
  })
  volumes = volumes.map(volume => {
    return Volume(volume, context)
  })
  services = services.map(service => {
    return Service(service, context)
  })
  stacks = stacks.map(stack => {
    return Stack(stack, context)
  })

  return {
    up: async.series([
      async.parallel([...networks, ...volumes].map(property('up'))),
      async.parallel([...services, ...stacks].map(property('up')))
    ]),
    down: async.series([
      async.parallel([...services, ...stacks].map(property('down'))),
      async.parallel([...networks, ...volumes].map(property('down')))
    ])
  }
}
