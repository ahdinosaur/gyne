const { identity, ifElse, toString } = require('ramda')
const { isString } = require('ramda-adjunct')

module.exports = ifElse(isString, identity, toString)
