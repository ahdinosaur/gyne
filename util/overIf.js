// https://github.com/ramda/ramda/wiki/Cookbook#overif

const { curry, unless, or, isNil, view, over } = require('ramda')

const overIf = curry((lens, fn) =>
  unless(or(isNil, view(lens)), over(lens, fn))
)

module.exports = overIf
