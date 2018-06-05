const {
  apply,
  both,
  defaultTo,
  equals,
  ifElse,
  map,
  merge,
  not,
  pipe,
  prop,
  props,
  tap
} = require('ramda')
const { ensureArray } = require('ramda-adjunct')

const Namespace = require('./util/namespace')
const populateFields = require('../util/populateFields')
const pickFields = require('../util/pickFields')
const coerceString = require('../util/coerceString')

const fromConfig = populateFields({
  Name: pipe(props(['namespace', 'name']), apply(Namespace.name)),
  Labels: pipe(
    props(['namespace', 'labels']),
    apply(Namespace.labels),
    defaultTo({}),
    map(coerceString)
  ),
  TaskTemplate: {
    ContainerSpec: {
      Image: prop('image'),
      Command: prop('command'),
      Args: prop('args'),
      Env: prop('env'),
      Mounts: value =>
        pipe(
          prop('volumes'),
          defaultTo([]),
          map(merge({ namespace: value.namespace })),
          map(
            populateFields({
              Target: prop('target'),
              Source: pipe(
                ifElse(
                  both(
                    pipe(prop('type'), equals('volume')),
                    pipe(prop('is_external'), equals(true), not)
                  ),
                  pipe(props(['namespace', 'source']), apply(Namespace.name)),
                  prop('source')
                )
              ),
              Type: prop('type'),
              ReadOnly: prop('is_read_only')
            })
          )
        )(value)
    },
    Placement: pipe(
      prop('placement'),
      populateFields({
        Constraints: prop('constraints')
      })
    ),
    RestartPolicy: pipe(
      tap(console.log),
      prop('restart_policy'),
      populateFields({
        Condition: prop('condition')
      })
    )
  },
  EndpointSpec: {
    Ports: pipe(
      prop('ports'),
      defaultTo([]),
      map(
        populateFields({
          Name: prop('name'),
          Protocol: prop('protocol'),
          TargetPort: prop('target'),
          PublishedPort: prop('published'),
          PublishMode: prop('mode')
        })
      )
    )
  },
  Networks: value =>
    pipe(
      prop('networks'),
      defaultTo([]),
      map(merge({ namespace: value.namespace })),
      map(
        ifElse(
          pipe(prop('is_external'), equals(true)),
          populateFields({
            Target: prop('name')
          }),
          populateFields({
            Target: pipe(props(['namespace', 'name']), apply(Namespace.name)),
            Aliases: pipe(prop('name'), ensureArray)
          })
        )
      )
    )(value)
})

const fromInspect = pipe(
  prop('Spec'),
  pickFields({
    Name: true,
    Labels: true,
    TaskTemplate: {
      ContainerSpec: {
        Image: true,
        Command: true,
        Env: true,
        Mounts: [
          {
            Target: true,
            Source: true,
            Type: true,
            ReadOnly: true
          }
        ]
      },
      Placement: {
        Constraints: true
      },
      RestartPolicy: {
        Condition: true
      }
    },
    EndpointSpec: {
      Ports: [
        {
          Name: true,
          Protocol: true,
          TargetPort: true,
          PublishedPort: true,
          PublishMode: true
        }
      ]
    },
    Networks: [
      {
        Target: true,
        Aliases: true
      }
    ]
  })
)

module.exports = {
  fromConfig,
  fromInspect
}
