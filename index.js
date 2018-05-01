const DockerApi = require('docker-remote-api')
// const { safeDump: toYaml } = require('js-yaml')

const async = require('./async')
const sync = require('./sync')

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
    up: async.series(
      [...stacks, ...networks, ...volumes].map(resource => {
        return cb => resource.up(cb)
      })
    ),
    down: async.series(
      [...stacks, ...networks, ...volumes].map(resource => {
        return cb => resource.down(cb)
      })
    )
  }
}

function Network (docker, options, on) {
  return {
    up: async.waterfall([
      async.swallowError(inspectId(options)),
      async.iff(sync.isNil, async.series([create(options), inspect(options)]))
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
    return async.waterfall([inspect(options), async.map(value => value.Id)])
  }

  function inspect (options) {
    const { name } = options
    return cb => {
      docker.get(`/networks/${name}`, { json: true }, cb)
    }
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
