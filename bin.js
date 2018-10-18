#!/usr/bin/env node

const { relative, isAbsolute } = require('path')
const { anyPass, contains, isNil, map, tap } = require('ramda')
const { isArray } = require('ramda-adjunct')
const parseArgs = require('minimist')
const ansi = require('ansi-escape-sequences')
const Future = require('fluture')
const Confirm = require('prompt-confirm')
const { safeDump: toYaml } = require('js-yaml')

const Gyne = require('./')

const { argv, cwd } = process
const script = isAbsolute(argv[1])
  ? `node ./${relative(cwd(), argv[1])}`
  : argv[1]

const USAGE = `
  $ ${clr(script, 'bold')} ${clr('<command>', 'green')} [options]

  Commands:

    up <config>
    down

  Options:

    -h, --help      print this usage
    -v, --verbose   output logs
      (nothing) prints fatal
      -v prints error
      -vv prints warning
      -vvv prints info
      -vvvv prints debug
    --pretty        pretty print log output
    --version       print version

  Examples:

  Bring up a system
  ${clr(`${script} up ./example/config.yml`, 'cyan')}

  Bring down a system
  ${clr(`${script} down`, 'cyan')}

`
  .replace(/\n$/, '')
  .replace(/^\n/, '')

const commands = ['up', 'down']
const isCommand = anyPass(map(contains, commands))
const args = parseArgs(process.argv.slice(2), {
  alias: {
    help: 'h',
    verbose: 'v'
  },
  string: ['verbose'],
  boolean: ['help', 'version', 'pretty']
})
;(function main (args) {
  if (args.help) {
    console.log(USAGE)
  } else if (args.version) {
    console.log(require('./package.json').version)
  } else if (args._.length > 0) {
    const context = {
      log: {
        prettyPrint: args.pretty,
        level: logLevelFromArgs(args)
      }
    }

    const [commandName, argConfig] = args._

    if (!isCommand(commandName)) {
      console.log(`Unexpected command: ${commandName}\n`)
      console.log(USAGE)
      process.exit(1)
      return
    }

    if (commandName === 'up' && isNil(argConfig)) {
      console.log(`Expected config, none given.\n`)
      console.log(USAGE)
      process.exit(1)
      return
    }

    const gyne = Gyne(context)

    const config = commandName === 'up' ? argConfig : {}

    run(gyne, config).fork(
      err => {
        throw err
      },
      () => console.log('done')
    )
  } else {
    console.log(USAGE)
    process.exit(1)
  }
})(args)

function run (gyne, config) {
  return gyne
    .diff(config)
    .map(
      tap(diff => {
        console.log(toYaml({ diff }, { skipInvalid: true }))
      })
    )
    .chain(diff => {
      const prompt = new Confirm(
        'Do you want to patch your system with these changes?'
      )
      const runPrompt = Future.encaseP(() => prompt.run())
      return runPrompt().chain(shouldRun => {
        return shouldRun ? gyne.patch(diff) : Future.of(null)
      })
    })
}

// https://github.com/choojs/bankai/blob/cae451d116f50b6915216ee804c55f703d093880/bin.js#L142-L144
function clr (text, color) {
  return process.stdout.isTTY ? ansi.format(text, color) : text
}

function logLevelFromArgs (args) {
  const { verbose } = args
  const verbosity = isArray(verbose) ? verbose.length : 1
  switch (verbosity) {
    case 0:
      return 'fatal'
    case 1:
      return 'error'
    case 2:
      return 'warning'
    case 3:
      return 'info'
    case 4:
      return 'debug'
    default:
      return 'debug'
  }
}
