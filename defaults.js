const DockerApi = require('docker-remote-api')
const { isNil, defaults } = require('lodash')
const Log = require('pino')
const prettyLogs = require('pino-colada')
const pumpify = require('pumpify')

const env = process.env.NODE_ENV
const isProduction = env === 'production'

function Context (context) {
  var { pretty = true, log, logStream, docker } = context

  if (isNil(log) || isNil(log.pino)) {
    const logOptions = defaults(log, {
      level: !isProduction ? 'debug' : 'info'
    })
    logStream = isNil(logStream)
      ? pretty ? pumpify(prettyLogs(), process.stdout) : process.stdout
      : logStream
    log = Log(logOptions, logStream)
  }

  docker = Docker(docker)

  return {
    pretty,
    log,
    logStream,
    docker
  }
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
