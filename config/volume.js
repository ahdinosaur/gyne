const namespaceName = require('../util/namespace')

module.exports = createVolumeConfig

function createVolumeConfig (config) {
  const { name, namespace } = config

  return {
    Name: namespaceName(name, namespace)
  }
}
