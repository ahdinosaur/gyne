const { configureRenderers } = require('folktale-validations')

const isPinoValidator = require('./isPinoValidator')

module.exports = createValidationError

const { failureRenderer } = configureRenderers({
  validatorMessages: {
    [isPinoValidator.uid]: isPinoValidator.failureRenderer
  }
})

function createValidationError (value) {
  const message = failureRenderer(value)
  return new Error(message)
}
