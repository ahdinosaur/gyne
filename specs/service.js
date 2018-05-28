const { apply, defaultTo, pipe, prop, props } = require('ramda')

const Namespace = require('./util/namespace')
const populateFields = require('../util/populateFields')
const pickFields = require('../util/pickFields')

const fromConfig = populateFields({
  Name: pipe(props(['namespace', 'name']), apply(Namespace.name)),
  Labels: pipe(
    props(['namespace', 'labels']),
    apply(Namespace.labels),
    defaultTo({})
  ),
  TaskTemplate: {
    ContainerSpec: {
      Image: prop('image')
    }
  }
})

const fromInspect = pipe(
  prop('Spec'),
  pickFields({
    Name: true,
    Labels: true,
    TaskTemplate: {
      ContainerSpec: {
        Image: true
      }
    }
  })
)

module.exports = {
  fromConfig,
  fromInspect
}
