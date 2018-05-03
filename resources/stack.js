const { assign, isNil, property } = require('lodash')

const async = require('../util/async')
const Network = require('./network')
const Volume = require('./volume')
const Service = require('./service')
const { Context } = require('../defaults')

module.exports = Stack

function Stack (config = {}, context = {}) {
  const { name } = config

  context = Context(context)

  if (isNil(context.namespace)) {
    context.namespace = name ? [name] : []
  }

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
    const { name } = stack
    const namespace = [...context.namespace, name]
    const nextContext = assign({}, context, { namespace })
    return Stack(stack, nextContext)
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
