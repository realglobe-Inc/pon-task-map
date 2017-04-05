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

const { fromComment, commentRegex, removeComments } = require('convert-source-map')
const { byPattern } = require('pon-task-compile')

/** @lends define */
function define (srcDir, destDir = srcDir, options = {}) {
  let {
    pattern = '*.js',
    watchDelay = 100,
    indent = 0
  } = options

  const compiler = (code, inputSourceMap = null, options = {}) => {
    let comment = (String(code).match(commentRegex) || []).pop()
    return [ removeComments(String(code)), comment && fromComment(comment).toJSON(indent) ]
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


