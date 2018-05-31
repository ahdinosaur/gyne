const { clone } = require('ramda')
const {
  validateIsArray,
  validateIsString,
  validateObjectWithConstraints
} = require('folktale-validations')

const { constraints: networkConstraints } = require('./network')
const { constraints: serviceConstraints } = require('./service')
const { constraints: volumeConstraints } = require('./volume')

const layerConstraints = {
  fields: [
    {
      name: 'name',
      validator: validateIsString
    },
    {
      name: 'networks',
      validator: validateIsArray,
      children: networkConstraints
    },
    {
      name: 'services',
      validator: validateIsArray,
      children: serviceConstraints
    },
    {
      name: 'volumes',
      validator: validateIsArray,
      children: volumeConstraints
    },
    {
      name: 'stacks',
      validator: validateIsArray
    }
  ]
}

// fractal stacks! (3 levels)
var constraints = clone(layerConstraints)
constraints.fields[4].children = clone(layerConstraints)
constraints.fields[4].children.fields[4].children = clone(layerConstraints)

module.exports = {
  constraints,
  validate: validateObjectWithConstraints(constraints)
}
