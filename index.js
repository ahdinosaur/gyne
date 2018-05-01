const DockerApi = require('docker-remote-api')
// const { safeDump: toYaml } = require('js-yaml')

const async = require('./util/async')
const Network = require('./resources/network')
const Volume = require('./resources/volume')

module.exports = {
  default: System,
  Docker,
  Network,
  Stack,
  System,
  Volume
}

function Docker (docker) {
  if (docker.type === 'docker-remote-api') return docker
  const options = Object.assign(docker, {
    version: 'v1.37'
  })
  return DockerApi(options)
}

function System (options = {}, on = {}) {
  const docker = Docker(options.docker)

  var { networks = [], stacks = [], volumes = [] } = options

  networks = networks.map(network => {
    return Network(docker, network, on)
  })
  stacks = stacks.map(stack => {
    return Stack(docker, stack, on)
  })
  volumes = volumes.map(volume => {
    return Volume(docker, volume, on)
  })

  return {
    up: async.series(
      [...networks, ...volumes, ...stacks].map(resource => {
        return cb => resource.up(cb)
      })
    ),
    down: async.series(
      [...stacks, ...volumes, ...networks].map(resource => {
        return cb => resource.down(cb)
      })
    )
  }
}

function Stack (docker, options, on) {
  return {
    // TODO use deploy --prune!
    up: cb => {
      on.debug('stack:up', { options })
      cb()
    },
    down: cb => {
      on.debug('stack:down', { options })
      cb()
    }
  }
}
