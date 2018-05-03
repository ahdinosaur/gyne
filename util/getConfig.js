const { readFile } = require('fs')
const { isObject, isString } = require('lodash')
const { parse: parseUrl } = require('url')
const { extname } = require('path')
const httpGet = require('simple-get')
const { safeLoad: fromYaml } = require('js-yaml')

const async = require('./async')

const fromJson = JSON.parse

module.exports = getConfig

function getConfig (config) {
  return async.waterfall([
    readConfig(config),
    normalizeConfig(),
    outputConfig()
  ])
}

function readConfig (config) {
  if (isString(config)) {
    const url = config
    const urlObject = parseUrl(url)
    const { href, protocol, path } = urlObject
    const type = extname(path).substring(1)

    if (protocol === 'file') {
      return async.waterfall([
        async.to(readFile)(path),
        data => async.of({ type, url, data })
      ])
    } else if (protocol === 'http' || protocol === 'https') {
      return async.waterfall([
        async.to(httpGet.concat)(href),
        (res, data) => async.of({ type, url, data })
      ])
    }
  }
  if (isObject(config)) {
    return async.of({
      type: 'object',
      data: config
    })
  }

  return async.error(new Error(`unexpected config: ${config}`))
}

function normalizeConfig () {
  return ({ type, url, data }) =>
    async.sync(() => {
      var object
      switch (type) {
        case 'json':
          object = fromJson(data)
          return { type: 'object', url, data: object }
        case 'yml':
        case 'yaml':
          object = fromYaml(data)
          return { type: 'object', url, data: object }
        case 'object':
          return { type, url, data }
        default:
          // this shouldn't happen
          throw new Error(`unexpected config type: ${type}`)
      }
    })
}

function outputConfig () {
  return ({ type, url, data }) =>
    async.sync(() => {
      return Object.assign({ url }, data)
    })
}
