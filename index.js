'use strict'

const {CPUProfileDataModel} = require('./lib/cpuProfileDataModel')
const {calculateTimelineData} = require('./lib/cpuProfileUtil')
const fs = require('fs')

const HELP_MSG = 'node index.js [file]'
const MINIMUM_TOTAL_TIME_MS = 10.0

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
const nodesFiltered = nodesUnique.filter(node => {
  return (node.total > MINIMUM_TOTAL_TIME_MS) &&
    (node.url.indexOf('/') === 0) // Disregard native JS
})

const compareTimesDesc = (nodeA, nodeB) => (nodeB.total - nodeA.total)
const nodesByTotalDesc = nodesFiltered.slice()
nodesByTotalDesc.sort(compareTimesDesc)

for (let node of nodesByTotalDesc) {
  console.log(`${node.url},${node.functionName},${node.lineNumber},${parseInt(node.total)}`)
}
