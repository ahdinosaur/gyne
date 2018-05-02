// TODO publish as `callstep`

const runSeries = require('run-series')
const runWaterfall = require('run-waterfall')
const runParallel = require('run-parallel')

module.exports = {
  error,
  iff,
  noop,
  of,
  parallel,
  series,
  swallowError,
  sync,
  tap,
  waterfall
}

function error (err) {
  return cb => cb(err)
}

function iff (predicate, ifTrue, ifFalse = noop) {
  return (...args) => {
    if (predicate(...args)) return ifTrue(...args)
    else return ifFalse(...args)
  }
}

function noop () {
  return cb => cb(null, null)
}

function parallel (continuables) {
  return cb => {
    runParallel(continuables, cb)
  }
}

function of (...values) {
  return cb => cb(null, ...values)
}

function series (continuables) {
  return cb => {
    runSeries(continuables, cb)
  }
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

function sync (fn) {
  return cb => {
    try {
      var result = fn()
    } catch (err) {
      return cb(err)
    }
    cb(null, result)
  }
}

function tap (fn) {
  return (...values) => {
    fn(...values)
    return of(...values)
  }
}

function waterfall (steps) {
  return topCb => {
    const callbackers = steps.map((step, index) => {
      return (...args) => {
        const cb = args.pop()
        const continuable = index === 0 ? step : step(...args)
        continuable(cb)
      }
    })
    runWaterfall(callbackers, topCb)
  }
}
