const runSeries = require('run-series')
const runWaterfall = require('run-waterfall')

module.exports = {
  iff,
  map,
  noop,
  series,
  swallowError,
  tap,
  waterfall
}

function iff (predicate, ifTrue, ifFalse = noop) {
  return (...args) => {
    const cb = args.pop()
    if (predicate(...args)) ifTrue(...args, cb)
    else ifFalse(...args, cb)
  }
}

function map (fn) {
  return (...args) => {
    const cb = args.pop()
    try {
      var result = fn(...args)
    } catch (err) {
      return cb(err)
    }
    cb(null, result)
  }
}

function noop (...args) {
  const cb = args.pop()
  cb(null, ...args)
}

function series (continuables) {
  return cb => runSeries(continuables, cb)
}

/* eslint-disable handle-callback-err */
function swallowError (continuable) {
  return cb => {
    continuable((err, result) => {
      cb(null, result)
    })
  }
}
/* eslint-enable handle-callback-err */

function tap (fn) {
  return (...args) => {
    const cb = args.pop()
    fn(...args)
    cb(null, ...args)
  }
}

function waterfall (continuables) {
  return cb => runWaterfall(continuables, cb)
}
