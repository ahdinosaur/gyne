const { assign, isNil } = require('lodash')

const { Context } = require('../defaults')
const async = require('../util/async')
const getConfig = require('../util/getConfig')
const { prefixName } = require('../util/namespace')

module.exports = generic

function generic (resourceName) {
  return function Resource (context = {}) {
    context = Context(context)

    const { docker, log } = context

    return {
      up (rawConfig) {
        return async.series([
          async.sync(() => log.debug(`${resourceName}:up`, { rawConfig })),
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
        ])
      },
      down (rawConfig) {
        return async.series([
          async.sync(() => log.debug(`${resourceName}:down`, { rawConfig })),
          async.waterfall([getConfig(rawConfig), config => remove(config)])
        ])
      }
    }

    function create (config) {
      var { Name: name } = config

      // namespace for nested stacks
      name = prefixName(context.namespace, name)

      return cb => {
        docker.post(
          `/${resourceName}s/create`,
          {
            // namespace name
            json: assign({}, config, { Name: name })
          },
          (err, response) => {
            if (err) {
              log.error(`Error creating ${resourceName}: ${name}`, err)
              cb(err)
              return
            }
            if (response.warning) {
              log.warn(response.Warning, {
                action: `${resourceName}:create`,
                config
              })
            }
            log.info(`${resourceName} created: ${name}`, {
              action: `${resourceName}:create`,
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
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        docker.get(
          `/${resourceName}s/${name}`,
          { json: true },
          (err, response) => {
            if (err) {
              log.error(`Error inspecting ${resourceName}: ${name}`, err)
              cb(err)
              return
            }
            log.info(`${resourceName} inspected: ${name}`, {
              action: `${resourceName}:inspect`,
              config,
              response
            })
            cb(null, response)
          }
        )
      }
    }

    function remove (config) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        docker.delete(`/${resourceName}s/${name}`, {}, err => {
          if (err) {
            log.error(err, `Error removing ${resourceName}: ${name}`)
            cb(err)
            return
          }
          log.info({
            action: `${resourceName}:remove`,
            config,
            message: `${resourceName} removed: ${name}`
          })
          cb()
        })
      }
    }
  }
}
