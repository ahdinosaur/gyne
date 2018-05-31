const Future = require('fluture')
const { complement, evolve, filter, map } = require('ramda')

const NetworkResource = require('./network')
const ServiceResource = require('./service')
const VolumeResource = require('./volume')

module.exports = StackResource

function StackResource (context) {
  const networkResource = NetworkResource(context)
  const serviceResource = ServiceResource(context)
  const volumeResource = VolumeResource(context)

  return {
    list,
    patch
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

  function patch (diff) {
    return Future.parallel(Infinity, [
      patchResource(networkResource)(diff.networks),
      patchResource(volumeResource)(diff.volumes)
    ]).chain(() => patchResource(serviceResource)(diff.services))
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

function patchResource (resource) {
  return diff => {
    return Future.parallel(10, [
      ...map(resource.create, diff.create),
      ...map(resource.update, diff.update),
      ...map(resource.remove, diff.remove)
    ])
  }
}
