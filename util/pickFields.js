const {
  uncurryN,
  filter,
  keys,
  lensProp,
  map,
  over,
  pick,
  pipe,
  prop
} = require('ramda')

const { isObject } = require('ramda-adjunct')

// pick all keys in fields
// for nested field, recurse over prop lens

const pickFields = uncurryN(2, fields => {
  const pickKeys = pick(keys(fields))

  const pickNests = pipe(
    filter(isObject),
    keys,
    map(key => {
      const lens = lensProp(key)
      const nestedField = prop(key, fields)
      return over(lens, pickFields(nestedField))
    })
  )(fields)

  return pipe(pickKeys, ...pickNests)
})

module.exports = pickFields
