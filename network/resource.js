const { GenericResource } = require('../resource')

module.exports = GenericResource({
  name: 'network',
  hasUpdate: false,
  idField: 'Id'
})
