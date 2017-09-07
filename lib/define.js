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

const {byPattern} = require('pon-task-compile')
const {Readable} = require('stream')
const {statAsync} = require('asfs')
const path = require('path')
const {cachedRequire} = require('pon-cache')

const mtimeOf = (filename) => statAsync(filename).catch(() => null)
  .then((state) => state ? state.mtime : null)

/** @lends define */
function define (srcDir, destDir = srcDir, options = {}) {
  const {
    pattern = '*.js',
    watchDelay = 100
  } = options

  const compiler = async (code, inputSourceMap = null, options = {}) => {
    // Require here to reduce initial loading time
    const exorcist = cachedRequire('exorcist')
    const moldSourceMap = cachedRequire('mold-source-map')
    const {dest, ctx} = options

    const molder = moldSourceMap.fromSource(String(code))
    if (!molder.comment) {
      return []
    }

    const readable = new Readable()
    readable.push(code)
    readable.push(null)

    const destMap = dest + '.map'

    // Skip if there is no need to compile
    {
      const destMTime = await mtimeOf(dest)
      const destMapMTime = await mtimeOf(destMap)
      const skip = destMTime && destMapMTime && (destMTime < destMapMTime)
      if (skip) {
        return [null, null]
      }
    }

    const piped = readable.pipe(exorcist(destMap))

    piped.on('close', () => {
      const {logger} = ctx
      logger.debug('File generated:', path.relative(ctx.cwd, destMap))
    })

    return [piped, null]
  }

  const task = byPattern(srcDir, destDir, compiler, {
    pattern,
    watchDelay,
    namer: (filename) => filename.replace(/\.map$/, '')
  })

  const {watch} = task

  return Object.assign(function map (ctx) {
    return task(ctx)
  }, {watch})
}

module.exports = define
