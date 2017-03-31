'use strict'

const pon = require('pon')
const map = require('pon-task-map')

async function tryExample () {
  let run = pon({
    'ui:map': map('public/js', 'public/js', {
      pattern: '*.js'
    })
  })

  run('ui:map')
}

tryExample()
