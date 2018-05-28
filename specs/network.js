const { apply, defaultTo, pipe, props } = require('ramda')

const Namespace = require('./util/namespace')
const populateFields = require('../util/populateFields')
const pickFields = require('../util/pickFields')

const fromConfig = populateFields({
  Name: pipe(props(['namespace', 'name']), apply(Namespace.name)),
  Labels: pipe(
    props(['namespace', 'labels']),
    apply(Namespace.labels),
    defaultTo({})
  )
})

const fromInspect = pickFields({
  Name: true,
  Labels: true
})

module.exports = {
  fromConfig,
  fromInspect
}
