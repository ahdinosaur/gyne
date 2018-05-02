const { isNil } = require('lodash')

const async = require('../util/async')

module.exports = Network

function Network (docker, options, on) {
  return {
    up: async.series([
      async.sync(() => on.debug('network:up', { options })),
      async.waterfall([
        async.swallowError(inspectId(options)),
        async.iff(isNil, () =>
          async.series([create(options), inspect(options)])
        )
      ])
    ]),
    down: async.series([
      async.sync(() => on.debug('network:down', { options })),
      remove(options)
    ])
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
          if (err) {
            on.error(`Error creating network: ${name}`, err)
            cb(err)
            return
          }
          if (response.warning) {
            on.warn(response.Warning, {
              action: 'network:create',
              options
            })
          }
          on.info(`Network created: ${name}`, {
            action: 'network:create',
            options,
            response
          })
          cb(null, response.Id)
        }
      )
    }
  }

  function inspectId (options) {
    return async.waterfall([
      inspect(options),
      value => async.sync(() => value.Id)
    ])
  }

  function inspect (options) {
    const { name } = options
    return cb => {
      docker.get(`/networks/${name}`, { json: true }, (err, response) => {
        if (err) {
          on.error(`Error inspecting network: ${name}`, err)
          cb(err)
          return
        }
        on.info(`Network inspected: ${name}`, {
          action: 'network:inspect',
          options,
          response
        })
        cb(null, response)
      })
    }
  }

  function remove (options) {
    const { name } = options
    return cb => {
      docker.delete(
        `/networks/${name}`,
        {
          json: true
        },
        err => {
          if (err) {
            on.error(err, `Error removing network: ${name}`)
            cb(err)
            return
          }
          on.info({
            action: 'network:remove',
            options,
            message: `Network removed: ${name}`
          })
          cb()
        }
      )
    }
  }
}
