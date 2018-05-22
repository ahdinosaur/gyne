const namespaceName = require('../util/namespace')

module.exports = createNetworkConfig

function createNetworkConfig (config) {
  const { name, namespace } = config

  return {
    Name: namespaceName(name, namespace)
  }
}
