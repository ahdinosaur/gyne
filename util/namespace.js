const { isEmpty, isNil } = require('ramda')

function namespaceName (name, namespace) {
  if (isNil(namespace) || isEmpty(namespace)) return name
  return `${namespace.join('__')}__${name}`
}

module.exports = namespaceName
