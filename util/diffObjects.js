const { anyPass, isEmpty, merge, not, pipe, prop, uncurryN } = require('ramda')
const { detailedDiff } = require('deep-object-diff')

const isPropNotEmpty = uncurryN(2, pipe(prop, isEmpty, not))
const getHasChanged = anyPass([
  isPropNotEmpty('updated'),
  isPropNotEmpty('deleted'),
  isPropNotEmpty('added')
])

module.exports = pipe(detailedDiff, diff => {
  const hasChanged = getHasChanged(diff)
  return merge(diff, { hasChanged })
})
