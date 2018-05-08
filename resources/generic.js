const { assign, isEmpty, isNil } = require('lodash')
const step = require('callstep')

const { Context, DOCKER_API_VERSION } = require('../defaults')
const { prefixName } = require('../util/namespace')
const wrapMethod = require('../util/wrapMethod')

module.exports = generic

function generic (resourceName) {
  return function Resource (context = {}) {
    context = Context(context)

    const { docker, log } = context

    return {
      up: wrapMethod({ log, method: `${resourceName}:up` })(up),
      down: wrapMethod({ log, method: `${resourceName}:down` })(down),
      create: wrapMethod({ log, method: `${resourceName}:create` })(create),
      remove: wrapMethod({ log, method: `${resourceName}:remove` })(remove)
    }

    function up (config) {
      return step.waterfall([
        step.swallowError(inspectId(config)),
        step.iff(isNil, () => step.series([create(config), inspect(config)]))
      ])
    }

    function down (config) {
      return remove(config)
    }

    function create (config) {
      var { Name: name } = config

      // namespace for nested stacks
      name = prefixName(context.namespace, name)

      return cb => {
        var json = assign({}, config, { Name: name })

        // if in namespace
        if (!isEmpty(context.namespace)) {
          // add stack label
          json.Labels = assign(
            {
              'com.docker.stack.namespace': context.namespace.join('__')
            },
            json.Labels
          )
        }

        docker.post(
          `/${resourceName}s/create`,
          {
            json,
            version: DOCKER_API_VERSION
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
      return step.waterfall([
        inspect(config),
        value => step.sync(() => value.Id)
      ])
    }

    function inspect (config) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        docker.get(
          `/${resourceName}s/${name}`,
          {
            json: true,
            version: DOCKER_API_VERSION
          },
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
        docker.delete(
          `/${resourceName}s/${name}`,
          {
            version: DOCKER_API_VERSION
          },
          err => {
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
          }
        )
      }
    }
  }
}
