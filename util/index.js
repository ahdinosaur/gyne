const { create: createSanctuary, env: sanctuaryEnv } = require('sanctuary')
const { env: flutureEnv } = require('fluture-sanctuary-types')
const { create: createDef } = require('sanctuary-def')
// const Future = require('fluture')

const checkTypes = process.env.NODE_ENV !== 'production'

const env = sanctuaryEnv
  .concat(flutureEnv)
  .concat(Object.values(require('../types')))

const S = createSanctuary({ checkTypes, env })
const def = createDef({ checkTypes, env })

module.exports = Object.assign(S, {
  def
})
