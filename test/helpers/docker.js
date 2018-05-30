const DockerApi = require('../../util/docker')
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
  this.handleRequest(method, path, options).done(callback)
}

function noop () {}
