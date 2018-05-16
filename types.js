const S = require('sanctuary')
const $ = require('sanctuary-def')
const isStream = require('is-stream')

const isNil = value => value == null
const isBoolean = value => typeof value === 'boolean'

const WritableStream = $.NullaryType('node/WritableStream')(
  'https://nodejs.org/api/stream.html'
)(isStream.writable)

const LogStreamOption = $.NullaryType('sanctuary-log/StreamOption')(
  'https://github.com/buttcloud/sanctuary-log#stream-option'
)(value => S.or(isNil(value), $.test([])(WritableStream)(value)))

const PrettyOption = $.NullaryType('sanctuary-log/PrettyOption')(
  'https://github.com/buttcloud/sanctuary-log#pretty-option'
)(value => S.or(isNil(value), isBoolean(value)))

const DebugOption = $.NullaryType('sanctuary-log/DebugOption')(
  'https://github.com/buttcloud/sanctuary-log#debug-option'
)(value => S.or(isNil(value), isBoolean(value)))

const LogOptions = $.RecordType({
  debug: DebugOption,
  pretty: PrettyOption,
  stream: LogStreamOption
})

const Logger = $.NullaryType('sanctuary-log/Logger')(
  'https://github.com/buttcloud/sanctuary-log#log'
)(value =>
  S.and(S.is(Object)(value), S.pipe([S.prop('pino'), S.is(String)], value))
)

module.exports = {
  LogOptions,
  Logger
}

/*

context

- debug = false
- pretty = false
- docker
  - request
  - host
  - version
- log
  - level
  - stream

stack config

- name?
- services?
- networks?
- volumes?

service config

up (context) (config) (cb)

down (context) (config) (cb)

*/
