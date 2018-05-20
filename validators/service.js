const {
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

module.exports = validateObjectWithConstraints({
  fields: [
    {
      name: 'name',
      validator: validateIsString,
      isRequired: true
    }
  ]
})
