const { isEmpty, isNil, merge } = require('ramda')

module.exports = {
  name: namespaceName,
  labels: namespaceLabels
}

function namespaceName (namespace, name) {
  if (isNil(namespace) || isEmpty(namespace)) return name
  return `${namespace.join('__')}__${name}`
}

function namespaceLabels (namespace, labels) {
  if (isNil(namespace) || isEmpty(namespace)) return labels
  // add stack label
  return merge(
    {
      'com.docker.stack.namespace': namespace.join('__')
    },
    labels
  )
}
