const { readFile } = require('fs')
const { isNil, isObject, isString } = require('lodash')
const { parse: parseUrl } = require('url')
const { extname } = require('path')
const httpGet = require('simple-get')
const { safeLoad: fromYaml } = require('js-yaml')
const step = require('callstep')

const fromJson = JSON.parse
const fetchUrl = url => callback => {
  httpGet.concat(url, (err, res, data) => {
    if (err) callback(err)
    else callback(data)
  })
}

module.exports = getConfig

function getConfig (config) {
  return step.waterfall([readConfig(config), normalizeConfig()])
}

function readConfig (config) {
  if (isString(config)) {
    const url = config
    const urlObject = parseUrl(url)
    const { href, protocol, path } = urlObject
    const type = extname(path).substring(1)

    if (isNil(protocol) || protocol === 'file') {
      return step.waterfall([
        step.to(readFile)(path),
        data => step.of({ type, data })
      ])
    } else if (protocol === 'http' || protocol === 'https') {
      return step.waterfall([fetchUrl(href), data => step.of({ type, data })])
    }
  }
  if (isObject(config)) {
    return step.of({
      type: 'object',
      data: config
    })
  }

  return step.error(new Error(`unexpected config: ${config}`))
}

function normalizeConfig () {
  return ({ type, data }) =>
    step.sync(() => {
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
