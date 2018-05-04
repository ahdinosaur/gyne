const { isEmpty } = require('lodash')

function prefixName (namespace, name) {
  if (isEmpty(namespace)) return name
  return `${namespace.join('__')}__${name}`
}

module.exports = {
  prefixName
}
