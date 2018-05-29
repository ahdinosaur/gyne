const {
  defaultRenderers: { failureRenderer }
} = require('folktale-validations')

module.exports = createValidationError

function createValidationError (value) {
  const message = failureRenderer(value)
  return new Error(message)
}
