const { apply, defaultTo, evolve, map, pipe, prop, props } = require('ramda')

const Namespace = require('./util/namespace')
const populateFields = require('../util/populateFields')
const pickFields = require('../util/pickFields')
const coerceString = require('../util/coerceString')

const fromConfig = populateFields({
  Name: pipe(props(['namespace', 'name']), apply(Namespace.name)),
  Driver: prop('driver'),
  DriverOpts: pipe(prop('options'), defaultTo({}), map(coerceString)),
  Labels: pipe(
    props(['namespace', 'labels']),
    apply(Namespace.labels),
    defaultTo({}),
    map(coerceString)
  )
})

const fromInspect = pipe(
  pickFields({
    Name: true,
    Driver: true,
    DriverOpts: true,
    Labels: true
  }),
  evolve({
    Driver: defaultTo('local'),
    DriverOpts: defaultTo({}),
    Labels: defaultTo({})
  })
)

module.exports = {
  fromConfig,
  fromInspect
}
