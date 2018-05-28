const {
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

const validate = validateObjectWithConstraints({
  fields: [
    {
      name: 'name',
      validator: validateIsString,
      isRequired: true
    }
  ]
})

module.exports = {
  validate
}
