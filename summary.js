'use strict'

const CPUProfile = require('./lib/cpuProfile')
const fs = require('fs')

const HELP_MSG = 'node index.js [file]'

const file = process.argv[process.argv.length - 1]
const data = fs.readFileSync(file)
const cpuProfile = new CPUProfile(data)
const nodes = cpuProfile.getFilteredTimelineData()
for (let node of nodes) {
  console.log(`${node.url}:${node.lineNumber},${node.functionName},${parseInt(node.total)}`)
}
