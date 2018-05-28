const test = require('ava')

const populateFields = require('./populateFields')

test('populate fields', t => {
  const fields = {
    a: ({ x }) => x,
    b: ({ y }) => y * 2,
    c: {
      d: ({ x, y }) => x + y
    }
  }
  const object = {
    x: 1,
    y: 2
  }
  const expected = {
    a: 1,
    b: 4,
    c: {
      d: 3
    }
  }
  const actual = populateFields(fields, object)
  t.deepEqual(actual, expected)
})
