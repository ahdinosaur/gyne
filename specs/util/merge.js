const { reduce } = require('ramda')

module.exports = mergeAllSpecs

function mergeAllSpecs (configs = []) {
  return reduce(mergeSpecs, {}, configs)
}

function mergeSpecs (first = {}, second = {}) {
  const {
    networks: firstNetworks = [],
    services: firstServices = [],
    volumes: firstVolumes = []
  } = first

  const {
    networks: secondNetworks = [],
    services: secondServices = [],
    volumes: secondVolumes = []
  } = second

  return {
    networks: [...firstNetworks, ...secondNetworks],
    services: [...firstServices, ...secondServices],
    volumes: [...firstVolumes, ...secondVolumes]
  }
}
