const { flow } = require('lodash')

const withLogs = require('./withLogs')
const withConfig = require('./withConfig')

const wrapMethod = ({ log, method }) => {
  return flow(withConfig({ log }), withLogs({ log, method }))
}

module.exports = wrapMethod
