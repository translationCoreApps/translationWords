const _ = require('lodash')

/**
 * Splice string into array of ranges, flagging what is selected
 * @param {array}  ranges - array of ranges [[int,int],...]
 * @returns {array} - array of objects [obj,...]
 */
module.exports.spliceStringOnRanges = function(string, ranges) {
  var selectionArray = [] // response
  // sort ranges - this ensures we build the string correctly and don't miss selections
  // concat overlaps - should not be a concern here but might help rendering bugs
  var remainingString = string
  // shift the range since the loop is destructive
  // by working on the remainingString and not original string
  var rangeShift = 0
  ranges.forEach(function(rangeObject) {
    var range = rangeObject.range
    // save all the text before the selection
    var beforeSelection = remainingString.slice(0,range[0]-rangeShift)
    // console.log('beforeSelection: ', beforeSelection)
    // save the text in the selection
    var selection = remainingString.slice(range[0]-rangeShift,range[1]+1-rangeShift)
    // console.log('subString: ', selection)
    // save all the text after the selection
    var afterSelection = remainingString.slice(range[1]-rangeShift+1)
    // console.log('afterSelection: ', afterSelection)
    selectionArray.push({text: beforeSelection, selected: false})
    selectionArray.push({
                          text: selection,
                          selected: true,
                          occurrence: rangeObject.occurrence,
                          occurrences: rangeObject.occurrences
                        })
    // next iteration is using remaining string
    remainingString = afterSelection
    // shift the range up to last char of substring (before+sub)
    rangeShift += beforeSelection.length
    rangeShift += selection.length
  })
  selectionArray.push({text: remainingString, selected: false})
  // remove empty text from selectionArray
  return selectionArray
}
//
// Use the following lines to test the previous function
// var string = "01 234 56789qwertyuiopasdfghjklzxcvbnmtyui01 234 567890"
// var ranges = [ { range: [ 45, 47 ], occurrence: 2, occurrences: 2 } ]
// console.log(module.exports.spliceStringOnRanges(string, ranges))

/**
 * This converts ranges to array of selection objects
 * @param {string} string - text used to get the ranges of
 * @param {array} selections - array of selections [obj,...]
 * @returns {array} - array of range objects
 */
module.exports.selectionsToRanges = function(string, selections) {
  var ranges = []
    selections.forEach(function(selection) {
      if (string.includes(selection.text)) {
        var splitArray = string.split(selection.text)
        var beforeSelection = splitArray.slice(0,selection.occurrence).join(selection.text)
        var start = beforeSelection.length
        var end = start + selection.text.length - 1
        var rangesObject = {
                            range: [start,end],
                            occurrence: selection.occurrence,
                            occurrences: selection.occurrences
                           }
        ranges.push(rangesObject)
      }
    })
  return ranges
}
//
// Use the following lines to test the previous function
// var string = "01 234 56789qwertyuiopasdfghjklzxcvbnmtyui01 234 567890"
// var selections = [
//   { text: '234', occurrence: 2, occurrences: 2 },
// ]
// console.log(module.exports.selectionsToRanges(string, selections))

/**
 * Splice string into array of substrings, flagging what is selected
 * @param {string} string - text used to get the ranges of
 * @param {array} selections - array of selections [obj,...]
 * @returns {array} - array of objects
 */
module.exports.selectionArray = function(string, selections) {
  var selectionArray = []
  var ranges = module.exports.selectionsToRanges(string, selections)
  selectionArray = module.exports.spliceStringOnRanges(string, ranges)
  return selectionArray
}
//
// Use the following lines to test the previous function
// var string = "01 234 56789qwertyuiopasdfghjklzxcvbnmtyui01 234 567890"
// var selections = [
//   { text: '234', occurrence: 2, occurrences: 2 },
// ]
// console.log(module.exports.selectionArray(string, selections))


/**
 * This abstracts complex handling of ranges such as order, deduping, concatenating, overlaps
 * @param {array}  ranges - array of ranges [[int,int],...]
 * @returns {array} - array of optimized ranges [[int,int],...]
 */
module.exports.optimizeRanges = function(ranges) {
  var optimizedRanges = [] // response
  ranges = _.sortBy(ranges, function(range) { return range[1] })// order ranges by end char index as secondary
  ranges = _.sortBy(ranges, function(range) { return range[0] })// order ranges by start char index as primary
  ranges = _.uniq(ranges) // remove duplicates
  // combine overlapping and contiguous ranges
  var _range = []
  ranges.forEach(function(range, index) {
    if (range[0] >= _range[0] && range[0] <= _range[1]+1) { // the start occurs in the running range and +1 handles contiguous
      if (range[1] >= _range[0] && range[1] <= _range[1]) { // if the start occurs inside running range then let's check the end
        // if the end occurs inside the running range then it's inside it and doesn't matter
      } else { // it doesn't occur inside the running range
        _range[1] = range[1] // extend running range
      }
    } else { // the start does not occur in the running range
      if (_range.length != 0) optimizedRanges.push(_range) // the running range is closed push it to optimizedRanges
      _range = range // reset the running range to this one
    }
    if (ranges.length === index + 1 && _range[1] - _range[0] >= 0) { // this is the last one and it isn't blank
      optimizedRanges.push(_range) // push the last one to optimizedRanges
    }
  })
  return optimizedRanges
}
//
// Use the following lines to test the previous function
var ranges = [[1,1],[5,9],[3,4],[7,10],[20,40],[15,16],[14,17]]
console.log(module.exports.optimizeRanges(ranges))
// => [ [ 1, 1 ], [ 3, 10 ], [ 14, 17 ], [ 20, 40 ] ]

/**
 * This converts ranges to array of selection objects
 * @param {string} string - text used to get the ranges of
 * @param {array} ranges - array of ranges [[int,int],...]
 * @returns {array} - array of selection objects
 */
 module.exports.rangesToSelections = function(string, ranges) {
   let selections = []
   ranges.forEach(function(range, index) {
     let start = range[0], end = range[1]
     let length = end - start + 1
     let text = string.substr(start, length) // get text
     let regex = eval('/' + text + '/g')
     let beforeText = string.substr(0,start)
     let beforeMatches = beforeText.match(regex)
     let occurrence = (beforeMatches !== null ? beforeMatches.length : 0) + 1 // get number of this occurrence
     let occurrences = string.match(regex).length // get occurrences in string
     let selection = {
       text: text,
       occurrence: occurrence,
       occurrences: occurrences
     };
     selections.push(selection)
   })
   return selections
 }
 //
 // Use the following lines to test the previous function
 // var string = "0123456789qwertyuiopasdfghjklzxcvbnmtyui01234567890"
 // var ranges = [ [3,9], [14,17], [20,40] ]
 // console.log(module.exports.rangesToSelections(string, ranges))
 // => [ { text: '3456789', occurrence: 1, occurrences: 2 },
 //      { text: 'tyui', occurrence: 1, occurrences: 2 },
 //      { text: 'asdfghjklzxcvbnmtyui0', occurrence: 1, occurrences: 1 }
 //    ]

/**
 * This abstracts complex handling of selections such as order, deduping, concatenating, overlapping ranges
 * @param {string} string - the text selections are found in
 * @param {array}  selections - array of selection objects [Obj,...]
 * @returns {array} - array of selection objects
 */
module.exports.optimizeSelections = function(string, selections) {
  let optimizedSelections // return
  var ranges = module.exports.selectionsToRanges(string, selections).map( rangeObject => rangeObject.range ) // get char ranges of each selection
  ranges = module.exports.optimizeRanges(ranges) // optimize the ranges
  optimizedSelections = module.exports.rangesToSelections(string, ranges) // convert optimized ranges into selections
  return optimizedSelections
}
//
// Use the following lines to test the previous function
// var string = "0123456789qwertyuiopasdfghjklzxcvbnmtyui01234567890"
// var string = "0123456789qwertyuiopasdfghjklzxcvbnmtyui01234567890"
// var selections = [
//   { text: '234', occurrence: 2, occurrences: 2 },
// ]
// var selections = [
//   { text: 'not found in here', occurrence: 2, occurrences: 2 },
//   { text: '234', occurrence: 1, occurrences: 2 },
//   { text: '56789', occurrence: 1, occurrences: 2 },
//   { text: '3456', occurrence: 1, occurrences: 2 },
//   { text: 'tyu', occurrence: 1, occurrences: 2 },
//   { text: 'yui', occurrence: 1, occurrences: 2 },
//   { text: 'yui', occurrence: 2, occurrences: 2 },
//   { text: 'asdfghjklzxcvbnmtyui0', occurrence: 1, occurrences: 1 }
// ]
// console.log(module.exports.optimizeSelections(string, selections))





// Use for testing/debugging...

// var string = 'abcdefghijklmnopqrstuvwxyz'
// var selectedText = [
//   {
//     "text": "cdef",
//     "occurrence": 1,
//     "occurrences": 1
//   },
//   {
//     "text": "klmno",
//     "occurrence": 1,
//     "occurrences": 1
//   },
//   {
//     "text": "wxyz",
//     "occurrence": 1,
//     "occurrences": 1
//   }
// ]

// var string = '012345678901234567890123456789'
// var selectedText = [
//   {
//     "text": "1234",
//     "occurrence": 1,
//     "occurrences": 3
//   },
//   {
//     "text": "01234",
//     "occurrence": 2,
//     "occurrences": 3
//   },
//   {
//     "text": "01234",
//     "occurrence": 3,
//     "occurrences": 3
//   }
// ]
// loop through occurrences to get character ranges
// var selectionCharacterRanges = [
//   [1,4],
//   [10,14],
//   [20,24]
// ]
// var ranges = module.exports.selectionsToRanges(string, selectedText)
// console.log(ranges)
//
// var selectionArray = module.exports.spliceStringOnRanges(string, ranges)
// console.log(selectionArray)

// var selectionArray = module.exports.selectionArray(string, selectedText)
// console.log(selectionArray)
