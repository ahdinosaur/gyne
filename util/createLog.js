const pumpify = require('pumpify')
const createPinoLogger = require('pino')
const prettyLogs = require('pino-colada')
const { def } = require('./')

const isNil = value => value == null

const { LogOptions, Logger } = require('../types')

module.exports = def('createLog')({})([LogOptions, Logger])(options => {
  const level = options.debug ? 'debug' : 'info'
  const stream = !isNil(options.stream)
    ? options.stream
    : options.pretty ? pumpify(prettyLogs(), process.stdout) : process.stdout

  const logger = createPinoLogger({ level }, stream)
  return logger
})

if (!module.parent) {
  module.exports({
    // debug: true,
    pretty: true,
    stream: process.stdout
  })
}
