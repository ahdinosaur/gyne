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
  return async.waterfall([readConfig(config), normalizeConfig()])
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
        data => async.of({ type, data })
      ])
    } else if (protocol === 'http' || protocol === 'https') {
      return async.waterfall([
        async.to(httpGet.concat)(href),
        (res, data) => async.of({ type, data })
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
  return ({ type, data }) =>
    async.sync(() => {
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
    })
}
