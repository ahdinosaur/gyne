// https://github.com/ramda/ramda/wiki/Cookbook#diffobjs---diffing-objects-similar-to-guavas-mapsdifference

const {
  __,
  always,
  anyPass,
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

const groupObjectBy = curry(
  pipe(
    // Call groupBy with the object as pairs, passing only the value to the key function
    useWith(groupBy, [useWith(__, [last]), toPairs]),
    map(fromPairs)
  )
)

const getHasChanged = anyPass([has('updated'), has('deleted'), has('added')])

const diffObjects = pipe(
  useWith(mergeWith(merge), [map(objOf('previous')), map(objOf('next'))]),
  groupObjectBy(
    cond([
      [
        both(has('previous'), has('next')),
        pipe(values, ifElse(apply(equals), always('common'), always('updated')))
      ],
      [has('previous'), always('deleted')],
      [has('next'), always('added')]
    ])
  ),
  evolve({
    common: map(prop('previous')),
    updated: map(prop('next')),
    deleted: map(prop('previous')),
    added: map(prop('next'))
  }),
  diff => {
    const hasChanged = getHasChanged(diff)
    return merge(diff, { hasChanged })
  }
)

module.exports = diffObjects
