#!/usr/bin/env node

const { relative, isAbsolute } = require('path')
const { isNil, pick } = require('lodash')
const parseArgs = require('minimist')
const ansi = require('ansi-escape-sequences')

const { Network, Service, Stack, Volume } = require('./')

const { argv, cwd } = process
const script = isAbsolute(argv[1]) ? relative(cwd(), argv[1]) : argv[1]

const resources = {
  network: Network,
  service: Service,
  stack: Stack,
  volume: Volume
}

const USAGE = `
  $ ${clr(script, 'bold')} ${clr(
  '<resource> <command> <config>',
  'green'
)} [options]

  Resources:

    network
    service
    stack
    volume

  Commands:

    up
    down

  Options:

    -d, --debug     include debug in log output
    -h, --help      print this usage
    -q, --quiet     don't output any logs
    --pretty        pretty print log output
    -v, --version   print version

  Examples:

  Bring up a stack
  ${clr(`${script} stack up ./example/config.json`, 'cyan')}

  Tear down a stack
  ${clr(`${script} stack down ./example/config.json`, 'cyan')}

`
  .replace(/\n$/, '')
  .replace(/^\n/, '')

const args = parseArgs(process.argv.slice(2), {
  alias: {
    debug: 'd',
    help: 'h',
    quiet: 'p',
    version: 'v'
  },
  boolean: ['debug', 'help', 'quiet', 'version']
})
;(function main (args) {
  if (args.help) {
    console.log(USAGE)
  } else if (args.version) {
    console.log(require('./package.json').version)
  } else if (args._.length === 3) {
    const [resourceName, commandName, config] = args._
    const Resource = resources[resourceName]

    if (isNil(Resource)) {
      console.log(`Unexpected resource: ${resourceName}\n`)
      console.log(USAGE)
      process.exit(1)
      return
    }

    const context = pick(args, ['debug', 'pretty'])

    const resource = Resource(context)
    const command = resource[commandName]

    if (isNil(command)) {
      console.log(`Unexpected command: ${commandName}\n`)
      console.log(USAGE)
      process.exit(1)
      return
    }

    const continuable = command(config)

    continuable(err => {
      if (err) throw err
    })
  } else {
    console.log(USAGE)
    process.exit(1)
  }
})(args)

// https://github.com/choojs/bankai/blob/cae451d116f50b6915216ee804c55f703d093880/bin.js#L142-L144
function clr (text, color) {
  return process.stdout.isTTY ? ansi.format(text, color) : text
}
