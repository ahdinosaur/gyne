const { apply, defaultTo, evolve, map, pipe, props } = require('ramda')

const Namespace = require('./util/namespace')
const populateFields = require('../util/populateFields')
const pickFields = require('../util/pickFields')
const coerceString = require('../util/coerceString')

const fromConfig = populateFields({
  Name: pipe(props(['namespace', 'name']), apply(Namespace.name)),
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
    Labels: true
  }),
  evolve({
    Labels: defaultTo({})
  })
)

module.exports = {
  fromConfig,
  fromInspect
}
