const { readFile, writeFile } = require('fs')
const { isObject, isString, partial } = require('lodash')
const { parse: parseUrl } = require('url')
const { extname } = require('path')
const httpGet = require('simple-get')
const { safeDump: toYaml } = require('js-yaml')
const { file: getTmpFilePath } = require('tempy')

const async = require('../util/async')

module.exports = Stack

function Stack (docker, options, on) {
  return {
    // TODO use deploy --prune!
    up: async.waterfall([
      async.tap(() => on.debug('stack:up', { options })),
      deploy(options)
    ]),
    down: cb => {
      on.debug('stack:down', { options })
      cb()
    }
  }

  function deploy (options) {
    const { stack } = options

    return async.waterfall([
      getStack(stack),
      async.tap(path => {
        console.log('path', path)
      })
    ])
  }
}

function getStack (stack) {
  return async.waterfall([readStack(stack), normalizeStack(), writeStack()])
}

function readStack (stack) {
  if (isString(stack)) {
    const stackUrl = parseUrl(stack)
    const { protocol, path } = stackUrl
    const type = extname(path).substring(1)

    if (protocol === 'file') {
      return async.waterfall([
        partial(readFile, stackUrl.path),
        async.map(data => ({ type, data }))
      ])
    } else if (protocol === 'http' || protocol === 'https') {
      return async.waterfall([
        partial(httpGet.concat, path),
        async.map((res, data) => ({ type, data }))
      ])
    }
  }
  if (isObject(stack)) {
    return async.of({
      type: 'json',
      data: JSON.stringify(stack)
    })
  }

  return async.error(new Error(`unexpected stack: ${stack}`))
}

function normalizeStack () {
  return async.map(({ type, data }) => {
    switch (type) {
      case 'json':
        const object = JSON.parse(data)
        const nextData = toYaml(object)
        return { type: 'yml', data: nextData }
      case 'yml':
      case 'yaml':
        return { type, data }
      default:
        // this shouldn't happen
        throw new Error(`unexpected stack type: ${type}`)
    }
  })
}

function writeStack () {
  return async.mapAsync(({ type, data }) => {
    const tmpPath = getTmpFilePath({ extension: type })
    return async.waterfall([
      partial(writeFile, tmpPath, data),
      async.of(tmpPath)
    ])
  })
}
