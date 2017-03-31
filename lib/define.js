/**
 * Define task
 * @function define
 * @param {string} srcDir - Source directory name
 * @param {string} destDir - Destination directory name
 * @param {string|string[]} [options.pattern='*.js'] - File name pattern
 * @param {Object} [options={}] - Optional settings
 * @param {number} [options.watchDelay=100] - Delay after watch
 * @param {number} [options.indent=0] - Number of file indent
 * @returns {function} Defined task
 */
'use strict'

const co = require('co')
const { fromComment, commentRegex } = require('convert-source-map')
const path = require('path')
const aglob = require('aglob')
const compile = require('pon-task-compile')
const watch = require('pon-task-watch')

/** @lends define */
function define (srcDir, destDir = srcDir, options = {}) {
  let {
    pattern = '*.js',
    watchDelay = 100,
    indent = 0
  } = options

  const resolvePaths = (filename) => ({
    src: path.resolve(srcDir, filename),
    dest: path.resolve(destDir, filename)
  })

  const compiler = (code, inputSourceMap = null, options = {}) => {
    let comment = (String(code).match(commentRegex) || []).pop()
    return [ code, comment && fromComment(comment).toJSON(indent) ]
  }

  function task (ctx) {
    return co(function * () {
      let filenames = yield aglob(pattern, { cwd: srcDir })
      let results = []
      for (let filename of filenames) {
        const { src, dest } = resolvePaths(filename)
        let result = yield compile(src, dest, compiler)(ctx)
        results.push(result)
      }
      return results
    })
  }

  return Object.assign(task,
    // Define sub tasks here
    {
      watch: (ctx) => co(function * () {
        return watch(
          [].concat(pattern).map((pattern) => path.join(srcDir, pattern)),
          (event, filename) => {
            const { src, dest } = resolvePaths(filename)
            compile(src, dest, compiler)(ctx)
          },
          {
            delay: watchDelay
          }
        )(ctx)
      })
    }
  )
}

module.exports = define


