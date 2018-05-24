const assert = require('assert')
const {
  difference,
  indexBy,
  map,
  prop,
  props,
  intersection,
  uniq
} = require('ramda')

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
  const update = props(namesToUpdate, nextByName)
  const remove = props(namesToRemove, currentByName)

  return {
    create,
    update,
    remove
  }
}

function assertNoDuplicateNames (names, message) {
  assert.equal(names.length, uniq(names).length, message)
}
