const { isNil } = require('ramda')
const Log = require('pino')
const prettyLogs = require('pino-colada')
const pumpify = require('pumpify')

const DockerApi = require('../util/docker')

function createContext (context) {
  var { debug = false, docker, log, logStream, pretty = false } = context

  if (isNil(log) || isNil(log.pino)) {
    if (isNil(log)) log = {}
    if (isNil(log.level)) {
      log.level = debug ? 'debug' : 'info'
    }
    logStream = isNil(logStream)
      ? pretty ? pumpify(prettyLogs(), process.stdout) : process.stdout
      : logStream
    log = Log(log, logStream)
  }

  docker = createDocker(docker)

  return Object.assign({}, context, {
    log,
    logStream,
    docker
  })
}

const DEFAULT_DOCKER_VERSION = 'v1.37'

function createDocker (docker = {}) {
  if (docker.type === 'docker-remote-api') return docker
  if (isNil(docker.version)) docker.version = DEFAULT_DOCKER_VERSION
  return DockerApi(docker)
}

module.exports = createContext
