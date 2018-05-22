const {
  validateIsArrayOf,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

const validateNetwork = require('./network')
const validateService = require('./service')
const validateVolume = require('./volume')

const validateStack = validateObjectWithConstraints({
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
      name: 'services',
      validator: validateIsArrayOf(validateService)
    },
    {
      name: 'volumes',
      validator: validateIsArrayOf(validateVolume)
    },
    {
      name: 'stacks',
      validator: validateIsArrayOf((...args) => {
        // save against circular dependency
        return validateStack(...args)
      })
    }
  ]
})

module.exports = validateStack
