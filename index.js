const DockerApi = require('docker-remote-api')
const runSeries = require('run-series')
const runWaterfall = require('run-waterfall')
// const { safeDump: toYaml } = require('js-yaml')

module.exports = {
  default: System,
  Docker,
  Network,
  Stack,
  System,
  Volume
}

function Docker (docker) {
  if (docker.type === 'docker-remote-api') return docker
  const options = Object.assign(docker, {
    version: 'v1.37'
  })
  return DockerApi(options)
}

function System (options = {}, on = {}) {
  const docker = Docker(options.docker)

  var { networks = [], stacks = [], volumes = [] } = options

  networks = networks.map(network => {
    return Network(docker, network, on)
  })
  stacks = stacks.map(stack => {
    return Stack(docker, stack, on)
  })
  volumes = volumes.map(volume => {
    return Volume(docker, volume, on)
  })

  return {
    up: series(
      [...stacks, ...networks, ...volumes].map(resource => {
        return cb => resource.up(cb)
      })
    ),
    down: series(
      [...stacks, ...networks, ...volumes].map(resource => {
        return cb => resource.down(cb)
      })
    )
  }
}

function Network (docker, options, on) {
  return {
    up: waterfall([
      swallowError(inspectId(options)),
      iff(isNil, series([create(options), inspect(options)]))
    ]),
    down: () => {}
  }

  function create (options) {
    const { name } = options
    return cb => {
      docker.post(
        '/networks/create',
        {
          json: {
            Name: name
          }
        },
        (err, response) => {
          if (err) return cb(err)
          if (response.warning) {
            on.warn({
              action: 'network:create',
              options,
              message: response.Warning
            })
          }
          on.event({
            action: 'network:create',
            options,
            message: `Network ${name} created.`,
            response
          })
          cb(null, response.Id)
        }
      )
    }
  }

  function inspectId (options) {
    return waterfall([inspect(options), map(value => value.Id)])
  }

  function inspect (options) {
    const { name } = options
    return cb => {
      docker.get(`/networks/${name}`, { json: true }, cb)
    }
  }
}

function series (continuables) {
  return cb => runSeries(continuables, cb)
}

function waterfall (continuables) {
  return cb => runWaterfall(continuables, cb)
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

function isNil (value) {
  return value == null
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

function iff (predicate, ifTrue, ifFalse = noop) {
  return (value, cb) => {
    if (predicate(value)) ifTrue(value, cb)
    else ifFalse(value, cb)
  }
}

function Stack (docker, options, on) {
  return {
    // use --prune!
    up: cb => {
      console.log('stack')
      cb()
    },
    down: () => {}
  }
}

function Volume (docker, options, on) {
  return {
    up: cb => {
      console.log('volume')
      cb()
    },
    down: () => {}
  }
}
