const GenericResource = require('./util/generic')

module.exports = GenericResource({
  name: 'service',
  hasUpdate: true,
  idField: 'ID'
})
