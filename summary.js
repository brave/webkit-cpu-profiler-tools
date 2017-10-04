'use strict'

const {CPUProfileDataModel} = require('./lib/cpuProfileDataModel')
const {calculateTimelineData} = require('./lib/cpuProfileUtil')
const fs = require('fs')

const HELP_MSG = 'node index.js [file]'
const MINIMUM_TOTAL_TIME_MS = 20.0

const file = process.argv[process.argv.length - 1]
const data = fs.readFileSync(file)
const profile = JSON.parse(data)
const profileModel = new CPUProfileDataModel(profile)
const timelineData = calculateTimelineData(profileModel)

const nodeIds = {}
for (let node of timelineData.entryNodes) {
  nodeIds[node.id] = node
}
const nodesUnique = Object.values(nodeIds)
const nodesPastThreshold = nodesUnique.filter(node => {
  return (node.total > MINIMUM_TOTAL_TIME_MS)
})

// Sort first by run time, so we can get total run time.
const compareTimesDesc = (nodeA, nodeB) => (nodeB.total - nodeA.total)
const nodesByTotalTimeDesc = nodesPastThreshold.slice()
nodesByTotalTimeDesc.sort(compareTimesDesc)

// Keep only things with local filename paths (e.g. not node stdlib).
const filterAppOnly = (node) => (node.url.indexOf('/') === 0)
const nodesAppOnly = nodesByTotalTimeDesc.filter(filterAppOnly)
// Get total run time (the longest running node)
nodesAppOnly.unshift(nodesByTotalTimeDesc[0])

for (let node of nodesAppOnly) {
  console.log(`${node.url}:${node.lineNumber},${node.functionName},${parseInt(node.total)}`)
}
