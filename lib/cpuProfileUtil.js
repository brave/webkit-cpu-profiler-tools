// XXX some sweet array monkey patches
Object.defineProperty(Array.prototype,"lowerBound",{
value:function(object,comparator,left,right)
{
function defaultComparator(a,b)
{
return a<b?-1:a>b?1:0;
}
comparator=comparator||defaultComparator;
var l=left||0;
var r=right!==undefined?right:this.length;
while(l<r){
var m=l+r>>1;
if(comparator(object,this[m])>0)
l=m+1;else
r=m;
}
return r;
}});

Object.defineProperty(Array.prototype,"upperBound",{
value:function(object,comparator,left,right)
{
function defaultComparator(a,b)
{
return a<b?-1:a>b?1:0;
}
comparator=comparator||defaultComparator;
var l=left||0;
var r=right!==undefined?right:this.length;
while(l<r){
var m=l+r>>1;
if(comparator(object,this[m])>=0)
l=m+1;else
r=m;
}
return r;
}});

Object.defineProperty(Uint32Array.prototype,"lowerBound",{
value:Array.prototype.lowerBound});
Object.defineProperty(Uint32Array.prototype,"upperBound",{
value:Array.prototype.upperBound});
Object.defineProperty(Float64Array.prototype,"lowerBound",{
value:Array.prototype.lowerBound});

const calculateTimelineData = function (profile) {
  /** @type {!Array.<?ChartEntry>} */
  var entries = [];
  /** @type {!Array.<number>} */
  var stack = [];
  var maxDepth = 5;

  function onOpenFrame() {
    stack.push(entries.length);
    // Reserve space for the entry, as they have to be ordered by startTime.
    // The entry itself will be put there in onCloseFrame.
    entries.push(null);
  }
  /**
   * @param {number} depth
   * @param {!SDK.CPUProfileNode} node
   * @param {number} startTime
   * @param {number} totalTime
   * @param {number} selfTime
   */
  function onCloseFrame(depth, node, startTime, totalTime, selfTime) {
    var index = stack.pop();
    entries[index] = new ChartEntry(depth, totalTime, startTime, selfTime, node);
    maxDepth = Math.max(maxDepth, depth);
  }
  profile.forEachFrame(onOpenFrame, onCloseFrame);

  /** @type {!Array<!SDK.CPUProfileNode>} */
  var entryNodes = new Array(entries.length);
  var entryLevels = new Uint16Array(entries.length);
  var entryTotalTimes = new Float32Array(entries.length);
  var entrySelfTimes = new Float32Array(entries.length);
  var entryStartTimes = new Float64Array(entries.length);

  for (var i = 0; i < entries.length; ++i) {
    var entry = entries[i];
    entryNodes[i] = entry.node;
    entryLevels[i] = entry.depth;
    entryTotalTimes[i] = entry.duration;
    entryStartTimes[i] = entry.startTime;
    entrySelfTimes[i] = entry.selfTime;
  }

  this._maxStackDepth = maxDepth + 1;

  return {
    entryNodes,
    entryLevels,
    entryTotalTimes,
    entryStartTimes,
    entrySelfTimes
  }
}

const ChartEntry = class {
  /**
   * @param {number} depth
   * @param {number} duration
   * @param {number} startTime
   * @param {number} selfTime
   * @param {!SDK.CPUProfileNode} node
   */
  constructor(depth, duration, startTime, selfTime, node) {
    this.depth = depth;
    this.duration = duration;
    this.startTime = startTime;
    this.selfTime = selfTime;
    this.node = node;
  }
};

module.exports = {
  calculateTimelineData
}
