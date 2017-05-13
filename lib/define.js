/**
 * Define task
 * @function define
 * @param {string} srcDir - Source directory name
 * @param {string} destDir - Destination directory name
 * @param {string|string[]} [options.pattern='*.js'] - File name pattern
 * @param {Object} [options={}] - Optional settings
 * @param {number} [options.watchDelay=100] - Delay after watch
 * @returns {function} Defined task
 */
'use strict'

const { byPattern } = require('pon-task-compile')
const { Readable } = require('stream')
const path = require('path')

/** @lends define */
function define (srcDir, destDir = srcDir, options = {}) {
  let {
    pattern = '*.js',
    watchDelay = 100
  } = options

  const compiler = (code, inputSourceMap = null, options = {}) => {
    // Require here to reduce initial loading time
    const exorcist = require('exorcist')
    const moldSourceMap = require('mold-source-map')
    let { dest, ctx } = options

    let molder = moldSourceMap.fromSource(String(code))
    if (!molder.comment) {
      return []
    }

    let readable = new Readable()
    readable.push(code)
    readable.push(null)

    let destMap = dest + '.map'
    let piped = readable.pipe(exorcist(destMap))

    piped.on('close', () => {
      let { logger } = ctx
      logger.debug('File generated:', path.relative(ctx.cwd, destMap))
    })

    return [ piped, null ]
  }

  let task = byPattern(srcDir, destDir, compiler, {
    pattern,
    watchDelay,
    namer: (filename) => filename.replace(/\.map$/, '')
  })

  let { watch } = task

  return Object.assign(function map (ctx) {
    return task(ctx)
  }, { watch })
}

module.exports = define
