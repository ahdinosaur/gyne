const { merge } = require('ramda')
const Log = require('pino')

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

  return Log(log, log.stream)
}

function createDocker (docker = {}) {
  if (docker.type === 'docker-remote-api') return docker
  return DockerApi(docker)
}

module.exports = createContext
