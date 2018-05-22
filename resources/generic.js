const assert = require('assert')
const Url = require('url')
const { merge, isBoolean, isEmpty, isNil, isString } = require('ramda')
const Future = require('fluture')

const { DOCKER_API_VERSION } = require('../defaults')
const { prefixName } = require('../util/namespace')

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

  return function Resource (context) {
    const { docker, log } = context

    return {
      create,
      down,
      inspect,
      up,
      update: hasUpdate ? update : undefined,
      remove
    }

    function up (config) {
      return inspect(config)
        .chainRej(err => {
          return err.status === 404 ? Future.of(null) : Future.reject(err)
        })
        .chain(value => {
          if (isNil(value)) {
            return create(config)
          }

          if (hasUpdate) {
            const { Version: { Index: version } } = value
            return update(config, { version })
          }

          return Future.of(null)
        })
        .chain(() => inspect(config))
    }

    function down (config) {
      return inspect(config)
        .chain(() => remove(config))
        .chainRej(err => {
          return err.status === 404 ? Future.of(null) : Future.reject(err)
        })
    }

    function create (config) {
      var { Name: name } = config

      // namespace for nested stacks
      name = prefixName(context.namespace, name)

      return Future((resolve, reject) => {
        var json = merge(config, { Name: name })

        // if in namespace
        if (!isEmpty(context.namespace)) {
          // add stack label
          json.Labels = merge(
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
              reject(err)
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
            resolve(getId(response))
          }
        )
      })
    }

    function inspect (config) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return Future((resolve, reject) => {
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
              reject(err)
              return
            }
            log.info(`Inspected ${resourceName}: ${name}`, {
              action: `${resourceName}:inspect:after`,
              config,
              response
            })
            resolve(response)
          }
        )
      })
    }

    function update (config, params) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return Future((resolve, reject) => {
        log.info(`Updating ${resourceName}: ${name}`, {
          action: `${resourceName}:update:before`,
          config,
          params
        })

        var json = merge(config, { Name: name })

        // if in namespace
        if (!isEmpty(context.namespace)) {
          // add stack label
          json.Labels = merge(
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
              reject(err)
              return
            }
            log.info({
              action: `${resourceName}:update:after`,
              config,
              message: `Updated ${resourceName}: ${name}`
            })
            resolve()
          }
        )
      })
    }

    function remove (config) {
      var { Name: name } = config

      name = prefixName(context.namespace, name)

      return Future((resolve, reject) => {
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
              reject(err)
              return
            }
            log.info({
              action: `${resourceName}:remove:after`,
              config,
              message: `Removed ${resourceName}: ${name}`
            })
            resolve()
          }
        )
      })
    }

    function getId (value) {
      return value[idField]
    }
  }
}
