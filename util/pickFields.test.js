const test = require('ava')

const pickFields = require('./pickFields')

test('pick keys', t => {
  const fields = {
    a: true,
    c: true
  }
  const object = {
    a: 1,
    b: 2,
    c: 3,
    d: 4
  }
  const expected = {
    a: 1,
    c: 3
  }
  const actual = pickFields(fields, object)
  t.deepEqual(actual, expected)
})

test('pick nested keys', t => {
  const fields = {
    a: {
      b: {
        c: true
      }
    },
    e: {
      f: true
    }
  }
  const object = {
    a: {
      b: {
        c: 1
      },
      d: 2
    },
    e: {
      f: 3,
      g: {
        h: 4
      }
    }
  }
  const expected = {
    a: {
      b: {
        c: 1
      }
    },
    e: {
      f: 3
    }
  }
  const actual = pickFields(fields, object)
  t.deepEqual(actual, expected)
})
