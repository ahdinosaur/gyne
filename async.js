const runSeries = require('run-series')
const runWaterfall = require('run-waterfall')

module.exports = {
  iff,
  map,
  noop,
  series,
  swallowError,
  waterfall
}

function iff (predicate, ifTrue, ifFalse = noop) {
  return (value, cb) => {
    if (predicate(value)) ifTrue(value, cb)
    else ifFalse(value, cb)
  }
}

function map (fn) {
  return (value, cb) => {
    try {
      var result = fn(value)
    } catch (err) {
      return cb(err)
    }
    cb(null, result)
  }
}

function noop (value, cb) {
  cb(null, value)
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

function waterfall (continuables) {
  return cb => runWaterfall(continuables, cb)
}
