# [gyne](https://en.wikipedia.org/wiki/Gyne) 🐝🐜

[![travis](https://travis-ci.org/buttcloud/gyne.svg?branch=master)](https://travis-ci.org/buttcloud/gyne) [![codecov](https://codecov.io/gh/buttcloud/gyne/branch/master/graph/badge.svg)](https://codecov.io/gh/buttcloud/gyne)

`gyne`, [the insect queen](https://en.wikipedia.org/wiki/Gyne), is a declarative interface to manage a Docker swarm

```shell
npm install --save gyne
```

## overview

given you have a `config.yml` that declares the complete state of your Docker swarm (including nested stacks),

you run:

```shell
gyne up config.yml
```

first, you will be shown the diff between the inspected state of the swarm and your declared state.

you are given a choice to accept or decline the patch.

if you accept, the Docker swarm will be updated to the declared state.

## example

```shell
npm install -g gyne
git clone git@github.com:buttcloud/gyne
cd gyne
# bring up your docker swarm
gyne up example/config.yml
# check out your docker swarm!
docker service ls
docker stack ls
curl -H "Host:service.example.com" localhost:4000/
curl -H "Host:viz.example.com" localhost:4000/
# bring down your docker swarm
gyne down
```

## cli

```
$ gyne <command> [options]

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
  gyne up ./example/config.yml

  Bring down a system
  gyne down
```

## api

### `Gyne = require('gyne')`

### `Gyne = require('gyne').default`

### `gyne = Gyne(context)`

where `context` is an optional object with:

* `docker`: [`docker-remote-api`](https://github.com/mafintosh/docker-remote-api) options or instance
* `log`: [`pino`](https://github.com/pinojs/pino) options or instance
  * `level`: what level of logs to print (default: `info`)
  * `pretty`: whether to pretty print logs (default: `false`)
  * `stream`: where to stream logs, (default: if `pretty`, then [`pino-colada`](https://github.com/lrlna/pino-colada), else `process.stdout`)

### `gyne.diff(config) => Future<Diff>`

`config` is object with:

* `Name`: (optional) namespace for networks, volumes, services, or nested stacks
* `Networks`: array of networks options
* `Volumes`: array of volume options
* `Services`: array of service options
* `Stacks`: array of stack options

returns a [`fluture`](https://github.com/fluture-js/Fluture) `Future` of the diff between your given config and the current config of the swarm.

### `gyne.patch(diff)`

returns a [`fluture`](https://github.com/fluture-js/Fluture) `Future` to execute the diff as a set of change operations.

## acknowledgements

sponsored by [ButtCloud](http://buttcloud.org)

## license

The Apache License

Copyright &copy; 2018 Michael Williams

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
