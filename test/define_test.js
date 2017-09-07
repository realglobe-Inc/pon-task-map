/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const ponContext = require('pon-context')
const {ok} = require('assert')
const asleep = require('asleep')
const writeout = require('writeout')
const browser = require('pon-task-browser')
const co = require('co')

describe('define', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {
  })

  it('Define', async () => {
    let ctx = ponContext()

    let srcDir = `${__dirname}/../misc/mocks`
    let src = srcDir + '/mock-entrypoint.js'
    let destDir = `${__dirname}/../tmp/testing-compiled`
    let dest = destDir + '/the-compiled.js'
    await browser(src, dest, {
      pattern: '*-entrypoint.js',
      debug: true
    })(ctx)

    let task = define(destDir, destDir, {})
    ok(task)

    await Promise.resolve(task(ctx))
  })

  it('Watch', async () => {
    const ctx = ponContext({})
    const srcDir = `${__dirname}/../tmp/testing-watching/src`
    const destDir = `${__dirname}/../tmp/testing-watching/dest`
    const src = srcDir + '/foo-entrypoint.js'
    const dest = destDir + '/foo-compiled.js'
    await writeout(src, 'module.exports = "hoge"', {mkdirp: true})
    await browser(src, dest, {pattern: '*-entrypoint.js', debug: true})(ctx)
    await asleep(100)
    define(destDir, destDir, {watchDelay: 1}).watch(ctx)
    await writeout(src, 'module.exports = "fuge"', {mkdirp: true})
    await browser(src, dest, {pattern: '*-entrypoint.js', debug: true})(ctx)
    await asleep(200)
    await writeout(src, 'module.exports = "moge"', {mkdirp: true})
    await browser(src, dest, {pattern: '*-entrypoint.js', debug: true})(ctx)
    await asleep(200)
  })
})

/* global describe, before, after, it */
