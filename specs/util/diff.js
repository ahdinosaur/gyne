const assert = require('assert')
const {
  complement,
  difference,
  filter,
  indexBy,
  map,
  pipe,
  prop,
  props,
  intersection,
  isNil,
  uniq
} = require('ramda')

const diffObjects = require('../../util/diffObjects')

module.exports = diffSpecs

function diffSpecs (current = {}, next = {}) {
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
      // console.log('current', JSON.stringify(current, null, 2))
      const next = nextByName[name]
      // console.log('next', JSON.stringify(next, null, 2))
      const diff = diffObjects(current, next)
      // console.log('diff', JSON.stringify(diff, null, 2))
      if (diff.hasChanged) return next
    }),
    filter(complement(isNil))
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
