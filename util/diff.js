// https://github.com/ramda/ramda/wiki/Cookbook#diffobjs---diffing-objects-similar-to-guavas-mapsdifference

const {
  __,
  always,
  apply,
  both,
  cond,
  curry,
  equals,
  evolve,
  fromPairs,
  groupBy,
  has,
  ifElse,
  last,
  map,
  merge,
  mergeWith,
  objOf,
  pipe,
  prop,
  toPairs,
  useWith,
  values
} = require('ramda')

const groupObjBy = curry(
  pipe(
    // Call groupBy with the object as pairs, passing only the value to the key function
    useWith(groupBy, [useWith(__, [last]), toPairs]),
    map(fromPairs)
  )
)

const diffObjs = pipe(
  useWith(mergeWith(merge), [
    map(objOf('leftValue')),
    map(objOf('rightValue'))
  ]),
  groupObjBy(
    cond([
      [
        both(has('leftValue'), has('rightValue')),
        pipe(
          values,
          ifElse(apply(equals), always('common'), always('difference'))
        )
      ],
      [has('leftValue'), always('onlyOnLeft')],
      [has('rightValue'), always('onlyOnRight')]
    ])
  ),
  evolve({
    common: map(prop('leftValue')),
    onlyOnLeft: map(prop('leftValue')),
    onlyOnRight: map(prop('rightValue'))
  })
)

module.exports = diffObjs
