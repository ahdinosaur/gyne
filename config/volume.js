const Namespace = require('../util/namespace')

const fields = {
  Name: true,
  Labels: true
}

module.exports = {
  create: createVolumeConfig,
  fields
}

function createVolumeConfig (config) {
  const { labels, name, namespace } = config

  return {
    Name: Namespace.name(namespace, name),
    Labels: Namespace.labels(namespace, labels)
  }
}