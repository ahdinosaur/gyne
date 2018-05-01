const DockerApi = require('docker-remote-api')
// const { safeDump: toYaml } = require('js-yaml')
const Bus = require('nanobus')

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
  return DockerApi(docker)
}

function System (options = {}) {
  if (!(this instanceof System)) return new System(options)

  this.docker = Docker(options.docker)

  const { networks = [], stacks = [], volumes = [] } = options

  this.networks = networks.map(network => {
    return Network(this.docker, network)
  })
  this.stacks = stacks.map(network => {
    return Stack(this.docker, network)
  })
  this.volumes = volumes.map(network => {
    return Volume(this.docker, network)
  })

  Bus.call(this)
}

System.prototype.up = function () {}

System.prototype.down = function () {}

function Stack (options) {
  //  const { docker } = options

  return {
    // use --prune!
    up: () => {},
    down: () => {}
  }
}

function Network (options) {}

function Volume (options) {}
