const Future = require('fluture')

module.exports = tap

function tap (fn) {
  return value => {
    fn(value)
    return Future.of(value)
  }
}
