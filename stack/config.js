const {
  validateIsArrayOf,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

const { validate: validateNetwork } = require('../network/config')
const { validate: validateService } = require('../service/config')
const { validate: validateVolume } = require('../volume/config')

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

module.exports = {
  validate: validateStack
}
