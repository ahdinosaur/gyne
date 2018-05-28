const assert = require('assert')
const {
  difference,
  filter,
  indexBy,
  map,
  merge,
  pipe,
  prop,
  props,
  intersection,
  uniq
} = require('ramda')

const diffObjects = require('../util/diffObjects')

module.exports = diffConfigs

function diffConfigs (current = {}, next = {}) {
  return {
    networks: diffResources('networks', current.networks, next.networks),
    services: diffResources('services', current.services, next.services),
    volumes: diffResources('volumes', current.volumes, next.volumes)
  }
}

const getName = prop('Name')
const getNames = map(getName)
const indexByName = indexBy(getName)

function diffResources (resourceName, current = [], next = []) {
  const currentNames = getNames(current)
  const nextNames = getNames(next)

  assertNoDuplicateNames(
    currentNames,
    `expected current ${resourceName} names to have no duplicates`
  )
  assertNoDuplicateNames(
    nextNames,
    `expected next ${resourceName} names to have no duplicates`
  )

  const namesToCreate = difference(nextNames, currentNames)
  const namesToUpdate = intersection(currentNames, nextNames)
  const namesToRemove = difference(currentNames, nextNames)

  const currentByName = indexByName(current)
  const nextByName = indexByName(next)

  const create = props(namesToCreate, nextByName)
  const remove = props(namesToRemove, currentByName)

  const getUpdate = pipe(
    map(name => {
      const current = currentByName[name]
      const next = nextByName[name]
      const diff = diffObjects(current, next)
      if (diff.hasChanged) {
        return merge(diff, { next })
      }
      return diff
    }),
    filter(prop('hasChanged'))
  )
  const update = getUpdate(namesToUpdate)

  return {
    create,
    update,
    remove
  }
}

function assertNoDuplicateNames (names, message) {
  assert.equal(names.length, uniq(names).length, message)
}