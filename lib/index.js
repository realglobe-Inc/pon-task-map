/**
 * Pon task to extract map files
 * @module pon-task-map
 * @version 2.1.4
 */

'use strict'

const define = require('./define')

let lib = define.bind(this)

Object.assign(lib, define, {
  define
})

module.exports = lib
