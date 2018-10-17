const { allPass, always, has } = require('ramda')
const { predicateValidator } = require('folktale-validations')

const uid = 'gyne.isPino'

const predicate = allPass([
  has('trace'),
  has('debug'),
  has('info'),
  has('warn'),
  has('fatal')
])

module.exports = {
  uid,
  validator: predicateValidator(predicate, uid),
  failureRenderer: always('Expected pino instance.')
}
