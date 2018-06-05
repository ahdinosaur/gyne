const Future = require('fluture')
const { complement, evolve, filter, map, reduce } = require('ramda')

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

  // 1. remove services
  // 2. create, remove, update volumes and networks
  // 3. create, update services
  function patch (diff) {
    return patchResource(serviceResource, ['remove'])(diff)
      .chain(() => {
        return Future.parallel(2, [
          patchResource(networkResource, ['create', 'update', 'remove'])(diff),
          patchResource(volumeResource, ['create', 'update', 'remove'])(diff)
        ])
      })
      .chain(() => {
        return patchResource(serviceResource, ['create', 'update'])(diff)
      })
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

function patchResource (resource, actions) {
  const resourceKey = `${resource.name}s`

  return diff => {
    const resourceDiff = diff[resourceKey]
    const futures = reduce(
      (sofar, action) => {
        return [...sofar, ...map(resource[action], resourceDiff[action])]
      },
      [],
      actions
    )
    return Future.parallel(10, futures)
  }
}
