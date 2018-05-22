const namespaceName = require('../util/namespace')

module.exports = createServiceConfig

function createServiceConfig (config) {
  const { image, name, namespace } = config

  return {
    Name: namespaceName(name, namespace),
    TaskTemplate: {
      ContainerSpec: {
        Image: image
      }
    }
  }
}
