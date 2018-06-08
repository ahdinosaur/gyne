const {
  validateIsBoolean,
  validateIsObject,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

const constraints = {
  fields: [
    {
      name: 'name',
      validator: validateIsString,
      isRequired: true
    },
    {
      name: 'labels',
      validator: validateIsObject
    },
    {
      name: 'driver',
      validator: validateIsString
    },
    {
      name: 'is_attachable',
      validator: validateIsBoolean,
      defaultValue: false
    }
  ]
}

module.exports = {
  constraints,
  validate: validateObjectWithConstraints(constraints)
}
