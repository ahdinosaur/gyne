const step = require('callstep')

module.exports = withLogs

function withLogs ({ log, method }) {
  return callstep => {
    return config => {
      return step.waterfall([
        step.of(config),
        step.tap(config => log.debug(`${method} call`, { config })),
        callstep,
        step.tap(result => log.debug(`${method} result`, { result }))
      ])
    }
  }
}
