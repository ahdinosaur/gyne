const { isArray, isPlainObject, mapValues } = require('lodash')

module.exports = deep

function deep (mapper) {
  return (object, lamda) => {
    return mapper(
      mapValues(object, value => {
        if (isPlainObject(value)) {
          return deep(mapper)(value, lamda)
        } else if (isArray(value)) {
          return value.map(item => deep(mapper)(item, lamda))
        }
        return value
      }),
      lamda
    )
  }
}
