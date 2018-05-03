const { isEmpty } = require('lodash')

function prefixName (namespace, name) {
  if (isEmpty(namespace)) return name
  return `${namespace.join('_')}_${name}`
}

module.exports = {
  prefixName
}
