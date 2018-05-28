const Future = require('fluture')
const { complement, evolve, filter } = require('ramda')

const NetworkResource = require('../network/resource')
const ServiceResource = require('../service/resource')
const VolumeResource = require('../volume/resource')

module.exports = StackResource

function StackResource (context) {
  const networkResource = NetworkResource(context)
  const serviceResource = ServiceResource(context)
  const volumeResource = VolumeResource(context)

  return {
    list
  }

  function list () {
    return Future.parallel(Infinity, [
      networkResource.list(),
      serviceResource.list(),
      volumeResource.list()
    ])
      .map(([networks, services, volumes]) => ({
        networks,
        services,
        volumes
      }))
      .map(
        evolve({
          networks: filter(complement(isDefaultNetwork))
        })
      )
  }
}

function isDefaultNetwork (network) {
  const { Name } = network
  return (
    Name === 'ingress' ||
    Name === 'bridge' ||
    Name === 'none' ||
    Name === 'docker_gwbridge' ||
    Name === 'host'
  )
}
