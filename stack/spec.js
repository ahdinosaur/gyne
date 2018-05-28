const { evolve, isNil, map, merge, pipe } = require('ramda')

const Network = require('../network/spec')
const Service = require('../service/spec')
const Volume = require('../volume/spec')

const mergeConfigs = require('../spec/merge')

const fromConfig = pipe(
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
    networks: map(Network.fromConfig),
    services: map(Service.fromConfig),
    volumes: map(Volume.fromConfig),
    stacks: map(stack => fromConfig(stack))
  }),
  config => {
    const { stacks = [] } = config
    const { networks, services, volumes } = config
    const stack = { networks, services, volumes }
    return mergeConfigs([stack, ...stacks])
  }
)

const fromInspect = evolve({
  networks: map(Network.fromInspect),
  services: map(Service.fromInspect),
  volumes: map(Volume.fromInspect)
})

module.exports = {
  fromConfig,
  fromInspect
}
