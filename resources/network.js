const GenericResource = require('./util/generic')

module.exports = GenericResource({
  name: 'network',
  hasUpdate: false,
  idField: 'Id'
})
