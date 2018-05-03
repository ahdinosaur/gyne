const { assign, isNil, mapKeys, partialRight } = require('lodash')

const { Context } = require('../defaults')
const async = require('../util/async')
const deep = require('../util/deep')
const pascalCase = require('../util/pascalCase')
const getConfig = require('../util/getConfig')
const { prefixName } = require('../util/namespace')

const deepPascalCase = partialRight(deep(mapKeys), (value, key) =>
  pascalCase(key)
)

module.exports = generic

function generic (resource) {
  return function (rawConfig, context = {}) {
    context = Context(context)

    const { docker, log } = context

    return {
      up: async.series([
        async.sync(() => log.debug(`${resource}:up`, { rawConfig })),
        async.waterfall([
          getConfig(rawConfig),
          config =>
            async.waterfall([
              async.swallowError(inspectId(config)),
              async.iff(isNil, () =>
                async.series([create(config), inspect(config)])
              )
            ])
        ])
      ]),
      down: async.series([
        async.sync(() => log.debug(`${resource}:down`, { rawConfig })),
        async.waterfall([getConfig(rawConfig), config => remove(config)])
      ])
    }

    function create (config) {
      var { name } = config

      // namespace for nested stacks
      name = prefixName(context.namespace, name)

      return cb => {
        docker.post(
          `/${resource}s/create`,
          {
            json: deepPascalCase(
              // namespace name
              assign({}, config, { name })
            )
          },
          (err, response) => {
            if (err) {
              log.error(`Error creating ${resource}: ${name}`, err)
              cb(err)
              return
            }
            if (response.warning) {
              log.warn(response.Warning, {
                action: `${resource}:create`,
                config
              })
            }
            log.info(`${resource} created: ${name}`, {
              action: `${resource}:create`,
              config,
              response
            })
            cb(null, response.Id)
          }
        )
      }
    }

    function inspectId (config) {
      return async.waterfall([
        inspect(config),
        value => async.sync(() => value.Id)
      ])
    }

    function inspect (config) {
      var { name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        docker.get(`/${resource}s/${name}`, { json: true }, (err, response) => {
          if (err) {
            log.error(`Error inspecting ${resource}: ${name}`, err)
            cb(err)
            return
          }
          log.info(`${resource} inspected: ${name}`, {
            action: `${resource}:inspect`,
            config,
            response
          })
          cb(null, response)
        })
      }
    }

    function remove (config) {
      var { name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        docker.delete(`/${resource}s/${name}`, {}, err => {
          if (err) {
            log.error(err, `Error removing ${resource}: ${name}`)
            cb(err)
            return
          }
          log.info({
            action: `${resource}:remove`,
            config,
            message: `${resource} removed: ${name}`
          })
          cb()
        })
      }
    }
  }
}
