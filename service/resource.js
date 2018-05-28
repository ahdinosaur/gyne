const { GenericResource } = require('../resource')

module.exports = GenericResource({
  name: 'service',
  hasUpdate: true,
  idField: 'ID'
})
