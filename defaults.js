const DockerApi = require('docker-remote-api')
const { isNil, defaults } = require('lodash')
const Log = require('pino')
const prettyLogs = require('pino-colada')
const pumpify = require('pumpify')

function Context (context) {
  var { debug = false, docker, log, logStream, pretty = false } = context

  if (isNil(log) || isNil(log.pino)) {
    const logOptions = defaults(log, {
      level: debug ? 'debug' : 'info'
    })
    logStream = isNil(logStream)
      ? pretty ? pumpify(prettyLogs(), process.stdout) : process.stdout
      : logStream
    log = Log(logOptions, logStream)
  }

  docker = Docker(docker)

  return Object.assign({}, context, {
    log,
    logStream,
    docker
  })
}

const DEFAULT_DOCKER_VERSION = 'v1.37'

function Docker (docker = {}) {
  if (docker.type === 'docker-remote-api') return docker
  return DockerApi(docker)
}

module.exports = {
  Context,
  DEFAULT_DOCKER_VERSION,
  Docker
}
