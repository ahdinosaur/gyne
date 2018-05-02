const DockerApi = require('docker-remote-api')
const { property } = require('lodash')

const async = require('./util/async')
const Network = require('./resources/network')
const Volume = require('./resources/volume')
const Stack = require('./resources/stack')

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
    up: async.series([
      async.parallel([...networks, ...volumes].map(property('up'))),
      async.parallel(stacks.map(property('up')))
    ]),
    down: async.series([
      async.parallel([...networks, ...volumes].map(property('down'))),
      async.parallel(stacks.map(property('down')))
    ])
  }
}
