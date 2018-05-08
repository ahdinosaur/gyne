const DockerApi = require('docker-remote-api')
const { assign, pick } = require('lodash')

module.exports = MockDockerApi

function MockDockerApi (options = {}) {
  if (!(this instanceof MockDockerApi)) return new MockDockerApi(options)

  this.handleRequest = options.handleRequest || noop
}

assign(
  MockDockerApi.prototype,
  pick(DockerApi.prototype, [
    'type',
    'get',
    'put',
    'post',
    'head',
    'del',
    'delete'
  ])
)

MockDockerApi.prototype.request = function (method, path, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = null
  }

  this.handleRequest(method, path, options, callback)
}

function noop () {}
