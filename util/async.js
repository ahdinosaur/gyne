const runSeries = require('run-series')
const runWaterfall = require('run-waterfall')

module.exports = {
  iff,
  ignoreValues,
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

function ignoreValues (continuable) {
  return (...args) => {
    const cb = args.pop()
    continuable(cb)
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
  return (...topArgs) => {
    const topCb = topArgs.pop()
    const enhancedContinuables = continuables.map(continuable => {
      return cb => {
        continuable(...topArgs, cb)
      }
    })
    runSeries(enhancedContinuables, topCb)
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

function tap (fn) {
  return (...args) => {
    const cb = args.pop()
    fn(...args)
    cb(null, ...args)
  }
}

function waterfall (continuables) {
  return (...topArgs) => {
    const topCb = topArgs.pop()
    const enhancedContinuables = continuables.map(continuable => {
      return (...args) => {
        const cb = args.pop()
        continuable(...topArgs, ...args, cb)
      }
    })
    runWaterfall(enhancedContinuables, topCb)
  }
}
