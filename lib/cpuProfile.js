'use strict'

const {CPUProfileDataModel} = require('./cpuProfileDataModel')
const {calculateTimelineData} = require('./cpuProfileUtil')
const fs = require('fs')

const DEFAULT_OPTIONS = {
  minimumTotalTimeMs: 30
}

class CPUProfile {
  constructor (data, options = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    const profile = JSON.parse(data)
    this.profileModel = new CPUProfileDataModel(profile)
    this.timelineData = calculateTimelineData(this.profileModel)
  }

  uniqueNodes (timelineData) {
    const nodeIds = {}
    for (let node of timelineData.entryNodes) {
      nodeIds[node.id] = node
    }
    return Object.values(nodeIds)
  }

  compareNodeTimesDesc (nodeA, nodeB) {
    return (nodeB.total - nodeA.total)
  }

  filterNodeByTotalTime (node) {
    return node.total > this.options.minimumTotalTimeMs
  }

  filterNodeAppOnly (node) {
    return node.url.indexOf('/') === 0
  }

  getFilteredTimelineData () {
    let nodes = this.uniqueNodes(this.timelineData)
    nodes = nodes.filter(this.filterNodeByTotalTime.bind(this))
    nodes.sort(this.compareNodeTimesDesc)
    const totalNode = nodes.shift(nodes[0])
    nodes = nodes.filter(this.filterNodeAppOnly)
    nodes.unshift(totalNode)
    return nodes
  }
}

module.exports = CPUProfile
