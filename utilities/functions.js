import { Dimensions } from 'react-native'
import Dictionary from '../constants/Dictionary'

export function convertItemToInputType(item, relationNamesArray) {
	delete item.id
	delete item.createdAt
	delete item.updatedAt
	delete item.__typename
	for (var i = 0; i < relationNamesArray.length; i++) {
		delete item[relationNamesArray[i]]
	}
	return item
}

export function smallestChipArray (sortedChips, sortedSegments) {
	const chips = sortedChips.slice(0)
	const segments = sortedSegments.slice(0)
  const chipsReversed = chips.slice(0).reverse()
  const segmentsReversed = segments.slice(0).reverse()
  var smallestDenominationRequiredArray = []
  
  for (var si = 0; si < segmentsReversed.length; si++) {
    let bb = segmentsReversed[si].bBlind || 0
    let sb = segmentsReversed[si].sBlind || 0
    let ante = segmentsReversed[si].ante || 0
    for (var ci = 0; ci < chipsReversed.length; ci++) {
      let d = chipsReversed[ci].denom
      if (sb % d === 0 && bb % d === 0 && ante % d === 0) {
        smallestDenominationRequiredArray.push(d)
        break
      }
      if (ci === chipsReversed.length - 1) {
        smallestDenominationRequiredArray.push("n/a")
      }
    }    
  }
  smallestDenominationRequiredArray.reverse()
  var lastSegmentRequiredArray = []
  var ratchet = 0
  for (var ci = 0; ci < chips.length; ci++) {
  	let segIndex = smallestDenominationRequiredArray.lastIndexOf(chips[ci].denom)
  	if (segIndex > ratchet) { ratchet = segIndex }
  	lastSegmentRequiredArray.push({denom: chips[ci].denom, color: chips[ci].color, segment: ratchet})
  }
  return lastSegmentRequiredArray
}

export function dictionaryLookup(value, section, returnType) {
	try {
		if (!section) {return Dictionary[value]}
		const resultObject = Dictionary[section].find((definition) => {
			return value == definition.shortName || value == definition.longName
		})
		if (returnType == "long" || returnType == "longName") {
			return resultObject.longName || null
		} else {
			return resultObject.shortName || null
		}
	}	catch (error) {
		return value
	}
}

export function	msToTime(duration, includeFractions, alwaysIncludeHours) {
  var negative = false
  if(duration<0) {
  	negative = true
  	duration = -duration
  }
  var milliseconds = parseInt((duration%1000)/100)
      , seconds = parseInt((duration/1000)%60)
      , minutes = parseInt((duration/(1000*60))%60)
      , hours = parseInt((duration/(1000*60*60))%24)
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds
  var output
  output = negative ? "-" : ""
  output += (hours > 0 || alwaysIncludeHours) ? hours + ":" : ""
  output += minutes + ":" + seconds
  output += includeFractions ? "." + milliseconds : "" 
  return output
}

export function numberToSuffixedString(number) {
	if (number === 0 || number === null) {return 0}
	if (number % 1000000 === 0 || (number > 1000000 && number % 1000000 === 500000)) {
		return (number / 1000000).toLocaleString() + "M"	
	}
	if (number % 1000 === 0 || (number > 1000 && number % 1000000 === 500)) {
		return (number / 1000).toLocaleString() + "k"
	}
	return number.toLocaleString()
}

export function tick(endOfRoundFunction, noticeSeconds, noticeFunction) {

	if (this.props.getTournamentQuery.loading || this.props.getTournamentQuery.error || this.props.getServerTimeMutation.loading || this.props.getServerTimeMutation.error) {return}
	const msPerMinute = 60 * 1000
	const noticeMilliseconds = noticeSeconds * 1000
	const tourney = this.props.getTournamentQuery.Tournament
	const segments = sortSegments(tourney.segments)
	const timer = tourney.timer
	const time = new Date()
	const totalElapsedMS = Math.max(0,timer.active ? timer.elapsed + time.valueOf() - this.state.offsetFromServerTime - new Date(timer.updatedAt).valueOf() : timer.elapsed)
	var cumulativeMS = 0
	var currentSegmentIndex = null
	for (var i = 0, len = segments.length; i < len; i++) {
	  if (totalElapsedMS >= cumulativeMS && totalElapsedMS < (cumulativeMS + segments[i].duration * msPerMinute)) {
	    currentSegmentIndex = i
	    break
	  }
	  cumulativeMS += segments[i].duration * msPerMinute
	}

	if(currentSegmentIndex==null) {
	  this.setState ({
	    time: time,
	    ms: 0,
	    display: {timer: "", currentBlinds: "", currentAnte: ""},
	    segment: segments[segments.length-1],
	    nextSegment: null,
	    csi: segments.length-1,
	    currentDuration: segments[segments.length-1].duration,
	    totalDuration: cumulativeMS,
	    percentage: 0,
	    noticeStatus: false,
	    timerActive: false,
	  })
	  return
	}
	const duration = cumulativeMS + segments[currentSegmentIndex].duration * msPerMinute
	const ms = duration - totalElapsedMS
	if (currentSegmentIndex > this.state.csi && currentSegmentIndex > 0 && this.state.csi != null && this.state.timerActive) {
		endOfRoundFunction()
	} else if (ms < noticeMilliseconds && this.state.ms >= noticeMilliseconds && this.state.timerActive && ms > noticeMilliseconds - 1000) {
		noticeFunction()
	}

	this.setState ({
	  time: time,
	  ms: ms,
	  display: {
	  	timer: timer.active ? msToTime(ms + 999) : msToTime(ms),
	  	currentBlinds: numberToSuffixedString(segments[currentSegmentIndex].sBlind) + '/' + numberToSuffixedString(segments[currentSegmentIndex].bBlind),
	  	currentAnte: segments[currentSegmentIndex].ante != null && "Ante: " + numberToSuffixedString(segments[currentSegmentIndex].ante)
	  },
	  segment: segments[currentSegmentIndex],
	  nextSegment: currentSegmentIndex < segments.length -1 ? segments[currentSegmentIndex + 1] : null,
	  csi: currentSegmentIndex,
	  currentDuration: segments[currentSegmentIndex].duration, 
	  totalDuration: duration,
	  percentage: ms/(segments[currentSegmentIndex].duration * msPerMinute),
	  noticeStatus: ms < noticeMilliseconds,
	  timerActive: timer.active,
	})
}

export function sortSegments (segments) {
	return segments.slice(0).sort((a,b) => {
		return (parseInt(a.sBlind || 0) + parseInt(a.bBlind || 0) + parseInt(a.ante || 0) - parseInt(b.sBlind || 0) - parseInt(b.bBlind || 0) - parseInt(b.ante || 0))
	})
}

export function sortChips (chips) {
	return chips.slice(0).sort((a,b) => {
		return (parseInt(a.denom) - parseInt(b.denom))
	})
}

export function sortEntryFees (fees) {
	const sortOrder = {
		Buyin: 1,
		House: 2,
		Charity: 3,
		Rebuy: 4,
		Addon: 5,
		Bounty: 6
	}
	return fees.slice(0).sort((a,b) => {
		if (a.costType !== b.costType) {
			return sortOrder[a.costType] - sortOrder[b.costType]
		} else if (a.price && b.price) {
			return b.price - a.price
		} else {
			return -1
		}
	})
}


export function totalItems (items) {
	var total = items.price * items.buys.length
}

const {height, width} = Dimensions.get('window');

export const responsiveHeight = (h) => {
  return height*(h/100);
}

export const responsiveWidth = (w) => {
  return width*(w/100);
}

export const responsiveFontSize = (f) => {
  return Math.sqrt((height*height)+(width*width))*(f/100);
}

export const checkUserCredits = (userId, creditsRequired) => {
	return
}

export const showRewardedAd = () => {
	return
}

export const rewardUser = (userId, credits) => {
	return
}

export const creditCheck = (userId, creditsRequired) => {
	if (checkUserCredits(userId, creditsRequired)) {
		return true
	} else {
		showRewardedAd().then(() => {
			rewardUser(userId, 100)
			return true
		})
	}
}