const { apply, defaultTo, map, pipe, prop, props } = require('ramda')

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
  ),
  Driver: prop('driver'),
  Attachable: prop('is_attachable')
})

const fromInspect = pickFields({
  Name: true,
  Labels: true,
  Driver: true,
  Attachable: true
})

module.exports = {
  fromConfig,
  fromInspect
}
