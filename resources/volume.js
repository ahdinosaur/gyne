const { isNil } = require('lodash')

const async = require('../util/async')

module.exports = volume

function volume (docker, options, on) {
  return {
    up: async.series([
      async.sync(() => on.debug('volume:up', { options })),
      async.waterfall([
        async.swallowError(inspectId(options)),
        async.iff(isNil, () =>
          async.series([create(options), inspect(options)])
        )
      ])
    ]),
    down: async.series([
      async.sync(() => on.debug('volume:down', { options })),
      remove(options)
    ])
  }

  function create (options) {
    const { name } = options
    return cb => {
      docker.post(
        '/volumes/create',
        {
          json: {
            Name: name
          }
        },
        (err, response) => {
          if (err) {
            on.error(`Error creating volume: ${name}`, err)
            cb(err)
            return
          }
          if (response.warning) {
            on.warn(response.Warning, {
              action: 'volume:create',
              options
            })
          }
          on.info(`volume created: ${name}`, {
            action: 'volume:create',
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
      docker.get(`/volumes/${name}`, { json: true }, (err, response) => {
        if (err) {
          on.error(`Error inspecting volume: ${name}`, err)
          cb(err)
          return
        }
        on.info(`volume inspected: ${name}`, {
          action: 'volume:inspect',
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
        `/volumes/${name}`,
        {
          json: true
        },
        err => {
          if (err) {
            on.error(err, `Error removing volume: ${name}`)
            cb(err)
            return
          }
          on.info({
            action: 'volume:remove',
            options,
            message: `volume removed: ${name}`
          })
          cb()
        }
      )
    }
  }
}
