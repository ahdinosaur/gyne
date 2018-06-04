const {
  defaultTo,
  filter,
  keys,
  lensProp,
  map,
  over,
  path,
  pick,
  pipe,
  prop,
  uncurryN
} = require('ramda')

const { isArray, isNotNil, isPlainObj } = require('ramda-adjunct')

// pick all keys in fields
// for nested field, recurse over prop lens
// for child field, recurse over prop lens for all items

const pickFields = uncurryN(2, fields => {
  const pickKeys = pick(keys(fields))

  const pickNests = pipe(
    filter(isPlainObj),
    keys,
    map(key => {
      const lens = lensProp(key)
      const nestedField = prop(key, fields)
      return over(lens, pipe(defaultTo({}), pickFields(nestedField)))
    })
  )(fields)

  const pickChilds = pipe(
    filter(isArray),
    keys,
    map(key => {
      const lens = lensProp(key)
      const childField = path([key, 0], fields)
      return over(lens, pipe(defaultTo([]), map(pickFields(childField))))
    })
  )(fields)

  return pipe(pickKeys, ...pickNests, ...pickChilds, filter(isNotNil))
})

module.exports = pickFields
