const { evolve, isNil, map, merge, pipe } = require('ramda')

const Network = require('./network')
const Service = require('./service')
const Volume = require('./volume')

const mergeConfigs = require('./merge')

const Stack = pipe(
  config => {
    var { name, namespace } = config

    namespace = isNil(namespace)
      ? isNil(name) ? [] : [name]
      : isNil(name) ? namespace : [...namespace, name]

    return evolve({
      networks: map(merge({ namespace })),
      services: map(merge({ namespace })),
      volumes: map(merge({ namespace })),
      stacks: map(merge({ namespace }))
    })(config)
  },
  evolve({
    networks: map(Network),
    services: map(Service),
    volumes: map(Volume),
    stacks: map(stack => Stack(stack))
  }),
  config => {
    const { stacks = [] } = config
    return mergeConfigs([config, ...stacks])
  }
)

module.exports = Stack
