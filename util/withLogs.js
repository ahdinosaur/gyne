const tap = require('./tap')
const waterfall = require('./waterfall')

module.exports = withLogs

function withLogs ({ log, method }) {
  return function wrappedWithLogs (step) {
    return waterfall([
      tap(config => log.debug(`${method} call`, { config })),
      step,
      tap(result => log.debug(`${method} result`, { result }))
    ])
  }
}
