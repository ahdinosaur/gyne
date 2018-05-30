const { pick } = require('ramda')
const Future = require('fluture')
const DockerBaseApi = require('docker-remote-api')

const DEFAULT_DOCKER_VERSION = 'v1.37'

module.exports = DockerApi
module.exports.DEFAULT_DOCKER_VERSION = DEFAULT_DOCKER_VERSION

function DockerApi (options = {}) {
  if (!(this instanceof DockerApi)) return new DockerApi(options)

  DockerBaseApi.call(this, options)

  this.version = options.version || DEFAULT_DOCKER_VERSION
}

DockerApi.prototype = Object.create(DockerBaseApi.prototype)

Object.assign(
  DockerApi.prototype,
  pick(['type', 'request'], DockerBaseApi.prototype)
)

DockerApi.prototype.get = wrapMethod(DockerBaseApi.prototype.get)
DockerApi.prototype.put = wrapMethod(DockerBaseApi.prototype.put)
DockerApi.prototype.post = wrapMethod(DockerBaseApi.prototype.post)
DockerApi.prototype.head = wrapMethod(DockerBaseApi.prototype.head)
DockerApi.prototype.del = wrapMethod(DockerBaseApi.prototype.del)
DockerApi.prototype.delete = wrapMethod(DockerBaseApi.prototype.delete)

function wrapMethod (method) {
  return function (path, options = {}) {
    options.version = options.version || this.version
    const encased = Future.encaseN2(method.bind(this))
    return encased(path, options)
  }
}
