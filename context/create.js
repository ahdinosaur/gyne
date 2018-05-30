const { isNil, merge } = require('ramda')
const Log = require('pino')
const prettyLogs = require('pino-colada')
const pumpify = require('pumpify')

const DockerApi = require('../util/docker')

function createContext (context) {
  var { docker, log } = context

  log = createLog(log)
  docker = createDocker(docker)

  return merge(context, {
    log,
    docker
  })
}

function createLog (log = {}) {
  if (log.pino) return log

  const logStream = isNil(log.stream)
    ? log.pretty ? pumpify(prettyLogs(), process.stdout) : process.stdout
    : log.stream

  return Log(log, logStream)
}

function createDocker (docker = {}) {
  if (docker.type === 'docker-remote-api') return docker
  return DockerApi(docker)
}

module.exports = createContext
