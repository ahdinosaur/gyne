#!/usr/bin/env node

const { relative, isAbsolute } = require('path')
const { readFile } = require('fs')
const { argv, cwd } = process

// const parseArgs = require('minimist')

const async = require('./util/async')
const { Stack } = require('./')

// const args = parseArgs(process.argv.slice(2))
const args = argv.slice(2)
const positionalArgs = args

const script = isAbsolute(argv[1]) ? relative(cwd(), argv[1]) : argv[1]
const command = positionalArgs[0]
const file = positionalArgs[1]

if (!command || !file) {
  console.log(`
${script} <command> <file>

e.g.
${script} up ./example/config.json
`)
  process.exit(0)
}

const readConfigFile = async.to(readFile)(file)
const readConfig = async.map(readConfigFile, JSON.parse)

async.waterfall([
  readConfig,
  config =>
    async.sync(() => {
      return Stack(config)
    }),
  stack => stack[command]
])(err => {
  if (err) throw err
})
