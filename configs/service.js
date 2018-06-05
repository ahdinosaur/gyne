const {
  orValidator,
  validateIsArray,
  validateIsArrayOf,
  validateIsBoolean,
  validateIsInteger,
  validateIsObject,
  validateIsString,
  validateIsWhitelistedValue,
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
      name: 'image',
      validator: validateIsString,
      isRequired: true
    },
    {
      name: 'labels',
      validator: validateIsObject,
      defaultValue: {}
    },
    {
      name: 'command',
      validator: orValidator(
        validateIsString,
        validateIsArrayOf(validateIsString)
      )
    },
    {
      name: 'volumes',
      validator: validateIsArray,
      children: {
        fields: [
          {
            name: 'type',
            validator: validateIsWhitelistedValue(['bind', 'volume', 'tmpfs']),
            isRequired: true
          },
          {
            name: 'source',
            validator: validateIsString,
            isRequired: true
          },
          {
            name: 'target',
            validator: validateIsString,
            isRequired: true
          },
          {
            name: 'is_read_only',
            validator: validateIsBoolean
          }
        ]
      }
    },
    {
      name: 'ports',
      validator: validateIsArray,
      children: {
        fields: [
          {
            name: 'name',
            validator: validateIsString
          },
          {
            name: 'protocol',
            validator: validateIsWhitelistedValue(['tcp', 'udp', 'sctp']),
            defaultValue: 'tcp'
          },
          {
            name: 'target',
            validator: validateIsInteger,
            isRequired: true
          },
          {
            name: 'published',
            validator: validateIsInteger,
            isRequired: true
          },
          {
            name: 'mode',
            validator: validateIsWhitelistedValue(['ingress', 'host']),
            defaultValue: 'ingress'
          }
        ]
      }
    },
    {
      name: 'placement',
      validator: validateIsObject,
      value: {
        fields: [
          {
            name: 'constraints',
            validator: validateIsArrayOf(validateIsString)
          }
        ]
      },
      defaultValue: {}
    },
    {
      name: 'restart_policy',
      validator: validateIsObject,
      value: {
        fields: [
          {
            name: 'condition',
            validator: validateIsWhitelistedValue([
              'none',
              'on-failure',
              'any'
            ]),
            defaultValue: 'any'
          }
        ]
      },
      defaultValue: {}
    },
    {
      name: 'networks',
      validator: validateIsObject,
      children: {
        fields: [
          {
            name: 'name',
            validator: validateIsString
          },
          {
            name: 'is_external',
            validator: validateIsBoolean
          }
        ]
      }
    }
  ]
}

module.exports = {
  constraints,
  validate: validateObjectWithConstraints(constraints)
}
