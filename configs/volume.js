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
      name: 'labels',
      validator: validateIsObject
    }
  ]
}

module.exports = {
  constraints,
  validate: validateObjectWithConstraints(constraints)
}
