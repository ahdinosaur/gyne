const { reduce } = require('ramda')

module.exports = mergeAllConfigs

function mergeAllConfigs (configs = []) {
  return reduce(mergeConfigs, {}, configs)
}

function mergeConfigs (first = {}, second = {}) {
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
