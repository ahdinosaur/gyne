const { readFile } = require('fs')
const { isNil } = require('ramda')
const { isObject, isString } = require('ramda-adjunct')
const { parse: parseUrl } = require('url')
const { extname } = require('path')
const httpGet = require('simple-get')
const { safeLoad: fromYaml } = require('js-yaml')
const Future = require('fluture')

const waterfall = require('../util/waterfall')

const fromJson = JSON.parse
const fetchUrl = (url, callback) => {
  httpGet.concat(url, (err, res, data) => {
    if (err) callback(err)
    else callback(data)
  })
}

const getConfig = waterfall([readConfig, Future.encase(normalizeConfig)])

module.exports = getConfig

function readConfig (config) {
  if (isString(config)) {
    const url = config
    const urlObject = parseUrl(url)
    const { href, protocol, path } = urlObject
    const type = extname(path).substring(1)

    if (isNil(protocol) || protocol === 'file') {
      return Future.encaseN(readFile)(path).chain(data =>
        Future.of({ type, data })
      )
    } else if (protocol === 'http' || protocol === 'https') {
      return Future.encaseN(fetchUrl)(href).chain(data =>
        Future.of({ type, data })
      )
    }
  }

  if (isObject(config)) {
    return Future.of({
      type: 'object',
      data: config
    })
  }

  return Future.reject(new Error(`unexpected config: ${config}`))
}

function normalizeConfig ({ type, data }) {
  switch (type) {
    case 'json':
      return fromJson(data)
    case 'yml':
    case 'yaml':
      return fromYaml(data)
    case 'object':
      return data
    default:
      // this shouldn't happen
      throw new Error(`unexpected config type: ${type}`)
  }
}
