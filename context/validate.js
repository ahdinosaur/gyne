const isStream = require('is-stream')
const {
  orValidator,
  predicateValidator,
  validateIsObject,
  validateIsBoolean,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')
const isPinoValidator = require('../util/isPinoValidator')

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
      validator: orValidator(
        isPinoValidator.validator,
        validateObjectWithConstraints({
          fields: [
            {
              name: 'level',
              validator: validateIsString
            },
            {
              name: 'prettyPrint',
              validator: validateIsBoolean,
              defaultValue: false
            },
            {
              name: 'stream',
              validator: predicateValidator(isStream.writable)
            }
          ]
        })
      )
    }
  ]
})
