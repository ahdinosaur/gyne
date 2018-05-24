const Namespace = require('../util/namespace')

const fields = {
  Name: true,
  Labels: true,
  TaskTemplate: {
    ContainerSpec: {
      Image: true
    }
  }
}

module.exports = {
  create: createServiceConfig,
  fields
}

function createServiceConfig (config) {
  const { image, labels, name, namespace } = config

  return {
    Name: Namespace.name(namespace, name),
    Labels: Namespace.labels(namespace, labels),
    TaskTemplate: {
      ContainerSpec: {
        Image: image
      }
    }
  }
}
