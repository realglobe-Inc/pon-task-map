/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const ponContext = require('pon-context')
const { ok } = require('assert')
const asleep = require('asleep')
const writeout = require('writeout')
const browser = require('pon-task-browser')
const co = require('co')

describe('define', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {
  }))

  it('Define', () => co(function * () {
    let ctx = ponContext()

    let srcDir = `${__dirname}/../misc/mocks`
    let src = srcDir + '/mock-entrypoint.js'
    let destDir = `${__dirname}/../tmp/testing-compiled`
    let dest = destDir + '/the-compiled.js'
    yield browser(src, dest, {
      pattern: '*-entrypoint.js',
      debug: true
    })(ctx)

    let task = define(destDir, destDir, {})
    ok(task)

    yield Promise.resolve(task(ctx))
  }))

  it('Watch', () => co(function * () {
    let ctx = ponContext({})
    let srcDir = `${__dirname}/../tmp/testing-watching/src`
    let destDir = `${__dirname}/../tmp/testing-watching/dest`
    let src = srcDir + '/foo-entrypoint.js'
    let dest = destDir + '/foo-compiled.js'
    yield writeout(src, 'module.exports = "hoge"', { mkdirp: true })
    yield browser(src, dest, { pattern: '*-entrypoint.js', debug: true })(ctx)
    yield asleep(100)
    define(destDir, destDir, { watchDelay: 1 }).watch(ctx)
    yield writeout(src, 'module.exports = "fuge"', { mkdirp: true })
    yield browser(src, dest, { pattern: '*-entrypoint.js', debug: true })(ctx)
    yield asleep(200)
    yield writeout(src, 'module.exports = "moge"', { mkdirp: true })
    yield browser(src, dest, { pattern: '*-entrypoint.js', debug: true })(ctx)
    yield asleep(200)
  }))
})

/* global describe, before, after, it */
