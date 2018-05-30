const isStream = require('is-stream')
const {
  predicateValidator,
  validateIsObject,
  validateIsBoolean,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

module.exports = validateObjectWithConstraints({
  fields: [
    {
      name: 'docker',
      validator: validateIsObject,
      value: {
        fields: [
          {
            name: 'host',
            validator: validateIsString
          },
          {
            name: 'version',
            validator: validateIsString
          }
        ]
      }
    },
    {
      name: 'log',
      validator: validateIsObject,
      value: {
        fields: [
          {
            name: 'level',
            validator: validateIsString
          },
          {
            name: 'pretty',
            validator: validateIsBoolean,
            defaultValue: false
          },
          {
            name: 'stream',
            validator: predicateValidator(isStream.writable)
          }
        ]
      }
    }
  ]
})
