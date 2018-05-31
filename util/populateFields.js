// oops this is a copy of `R.applySpec`

const { curry, filter, isNil, pipe, reduce, toPairs } = require('ramda')
const { isFunction } = require('ramda-adjunct')

const populateFields = curry((fields, object) => {
  return pipe(
    toPairs,
    reduce((sofar, [nextKey, nextPopulator]) => {
      const value = isFunction(nextPopulator)
        ? nextPopulator(object)
        : populateFields(nextPopulator, object)
      sofar[nextKey] = value
      return sofar
    }, {}),
    filter(isNil)
  )(fields)
})

module.exports = populateFields
