const { GenericResource } = require('../resource')

module.exports = GenericResource({
  name: 'volume',
  hasUpdate: false,
  idField: 'Name',
  listField: 'Volumes'
})
