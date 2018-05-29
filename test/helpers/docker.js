const DockerApi = require('docker-remote-api')
const { pick } = require('ramda')

module.exports = MockDockerApi

function MockDockerApi (options = {}) {
  if (!(this instanceof MockDockerApi)) return new MockDockerApi(options)

  this.handleRequest = options.handleRequest || noop
}

Object.assign(
  MockDockerApi.prototype,
  pick(
    ['type', 'get', 'put', 'post', 'head', 'del', 'delete'],
    DockerApi.prototype
  )
)

MockDockerApi.prototype.request = function (method, path, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = null
  }

  this.handleRequest(method, path, options, callback)
}

function noop () {}
