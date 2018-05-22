const Future = require('fluture')
const { reduce } = require('ramda')

module.exports = waterfall

function waterfall (steps) {
  console.log('steps', steps)
  return value =>
    reduce((sofar, next) => sofar.chain(next), Future.of(value), steps)
}
