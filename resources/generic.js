const assert = require('assert')
const Url = require('url')
const {
  assign,
  isBoolean,
  isEmpty,
  isNil,
  isString,
  negate
} = require('lodash')
const step = require('callstep')

const { Context, DOCKER_API_VERSION } = require('../defaults')
const { prefixName } = require('../util/namespace')
const wrapMethod = require('../util/wrapMethod')

module.exports = generic

function generic (options) {
  const { name: resourceName, hasUpdate, idField } = options

  assert(
    isString(resourceName),
    `docker-up/resources/generic.js: required string 'name', given: ${resourceName}`
  )
  assert(
    isBoolean(hasUpdate),
    `docker-up/resources/generic.js: required boolean 'hasUpdate', given: ${hasUpdate}`
  )
  assert(
    isString(idField),
    `docker-up/resources/generic.js: required string 'idField', given: ${idField}`
  )

  return function Resource (context = {}) {
    context = Context(context)

    const { docker, log } = context

    return {
      create: wrapMethod({ log, method: `${resourceName}:create` })(create),
      down: wrapMethod({ log, method: `${resourceName}:down` })(down),
      inspect: wrapMethod({ log, method: `${resourceName}:inspect` })(inspect),
      up: wrapMethod({ log, method: `${resourceName}:up` })(up),
      update: hasUpdate
        ? wrapMethod({ log, method: `${resourceName}:update` })(update)
        : undefined,
      remove: wrapMethod({ log, method: `${resourceName}:remove` })(remove)
    }

    function up (config) {
      return step.waterfall([
        step.swallowError(inspect(config)),
        step.iff(
          isNil,
          () => create(config),
          hasUpdate
            ? ({ Version: { Index: version } }) => update(config, { version })
            : step.noop
        ),
        () => inspect(config)
      ])
    }

    function down (config) {
      return step.waterfall([
        step.swallowError(inspect(config)),
        step.iff(negate(isNil), () => remove(config), step.noop)
      ])
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
            cb(null, getId(response))
          }
        )
      }
    }

    function inspect (config) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        log.info(`Inspecting ${resourceName}: ${name}`, {
          action: `${resourceName}:inspect:before`,
          config
        })

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
            log.info(`Inspected ${resourceName}: ${name}`, {
              action: `${resourceName}:inspect:after`,
              config,
              response
            })
            cb(null, response)
          }
        )
      }
    }

    function update (config, params) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        log.info(`Updating ${resourceName}: ${name}`, {
          action: `${resourceName}:update:before`,
          config,
          params
        })

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

        const url = Url.format({
          pathname: `/${resourceName}s/${name}/update`,
          query: params
        })

        docker.post(
          url,
          {
            json,
            version: DOCKER_API_VERSION
          },
          err => {
            if (err) {
              log.error(err, `Error updating ${resourceName}: ${name}`)
              cb(err)
              return
            }
            log.info({
              action: `${resourceName}:update:after`,
              config,
              message: `Updated ${resourceName}: ${name}`
            })
            cb()
          }
        )
      }
    }

    function remove (config) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return cb => {
        log.info(`Removing ${resourceName}: ${name}`, {
          action: `${resourceName}:remove:before`,
          config
        })

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
              action: `${resourceName}:remove:after`,
              config,
              message: `Removed ${resourceName}: ${name}`
            })
            cb()
          }
        )
      }
    }

    function getId (value) {
      return value[idField]
    }
  }
}
