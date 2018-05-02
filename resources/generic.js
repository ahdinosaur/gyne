const { isNil, mapKeys, partialRight } = require('lodash')

const async = require('../util/async')
const deep = require('../util/deep')
const pascalCase = require('../util/pascalCase')

const deepPascalCase = partialRight(deep(mapKeys), (value, key) =>
  pascalCase(key)
)

module.exports = generic

function generic (resource) {
  return function (docker, options, on) {
    return {
      up: async.series([
        async.sync(() => on.debug(`${resource}:up`, { options })),
        async.waterfall([
          async.swallowError(inspectId(options)),
          async.iff(isNil, () =>
            async.series([create(options), inspect(options)])
          )
        ])
      ]),
      down: async.series([
        async.sync(() => on.debug(`${resource}:down`, { options })),
        remove(options)
      ])
    }

    function create (options) {
      const { name } = options
      return cb => {
        docker.post(
          `/${resource}s/create`,
          {
            json: deepPascalCase(options)
          },
          (err, response) => {
            if (err) {
              on.error(`Error creating ${resource}: ${name}`, err)
              cb(err)
              return
            }
            if (response.warning) {
              on.warn(response.Warning, {
                action: `${resource}:create`,
                options
              })
            }
            on.info(`${resource} created: ${name}`, {
              action: `${resource}:create`,
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
        docker.get(`/${resource}s/${name}`, { json: true }, (err, response) => {
          if (err) {
            on.error(`Error inspecting ${resource}: ${name}`, err)
            cb(err)
            return
          }
          on.info(`${resource} inspected: ${name}`, {
            action: `${resource}:inspect`,
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
        docker.delete(`/${resource}s/${name}`, {}, err => {
          if (err) {
            on.error(err, `Error removing ${resource}: ${name}`)
            cb(err)
            return
          }
          on.info({
            action: `${resource}:remove`,
            options,
            message: `${resource} removed: ${name}`
          })
          cb()
        })
      }
    }
  }
}
