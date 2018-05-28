const GenericResource = require('./util/generic')

module.exports = GenericResource({
  name: 'volume',
  hasUpdate: false,
  idField: 'Name',
  listField: 'Volumes'
})
