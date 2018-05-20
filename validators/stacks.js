const {
  validateIsArrayOf,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

const validateNetwork = require('./network')
const validateService = require('./service')
const validateVolume = require('./volume')

module.exports = validateObjectWithConstraints({
  fields: [
    {
      name: 'name',
      validator: validateIsString
    },
    {
      name: 'networks',
      validator: validateIsArrayOf(validateNetwork)
    },
    {
      name: 'service',
      validator: validateIsArrayOf(validateService)
    },
    {
      name: 'volume',
      validator: validateIsArrayOf(validateVolume)
    }
  ]
})
