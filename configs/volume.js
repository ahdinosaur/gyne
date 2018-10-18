const {
  validateIsString,
  validateIsObject,
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
      name: 'driver',
      validator: validateIsString
    },
    {
      name: 'options',
      validator: validateIsObject
    },
    {
      name: 'labels',
      validator: validateIsObject
    }
  ]
}

module.exports = {
  constraints,
  validate: validateObjectWithConstraints(constraints)
}
