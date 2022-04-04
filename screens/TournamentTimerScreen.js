import { gql, useMutation, useSubscription} from '@apollo/client'
import React, { useState, useEffect, useReducer } from 'react'
import { Animated, ActivityIndicator, View, StyleSheet, } from 'react-native'
import { Button, Icon, Text } from 'react-native-elements'
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useKeepAwake} from 'expo-keep-awake';
import useDimensions from '@rnhooks/dimensions'
import CircularProgress from 'react-native-circular-progress-indicator'

import { ErrorMessage } from '../components/ErrorMessage'
import { AppOptions } from '../config'
import { smallestChipArray, msToTime, numberToSuffixedString, sortChips, sortSegments, responsiveFontSize, responsiveWidth, responsiveHeight} from '../utilities/functions'
import { AppLayout } from '../components/AppLayout'

const initialState = {
  newCSI: 0,
  remainingTimeMS: 0,
  lastSI: 0,
  currentBlindsText: "---/--- + ---",
  nextBlindsText: "---/--- + ---",
  currentDurationText: "-- Minutes",
  nextDurationText: "-- Minutes",
  isActive: false,
  countdownText: "00:00",
  noticeStatus: false,
  currentSegmentFinishTime: null,
  currentSegmentNoticeTime: null,
  currentTime: new Date(),
  title: "",
  subtitle: "",
  currentSegmentCumulativeDuration: 0,
}

const stateCalculator = (payload) => {
  const { Timers, Chips, Segments, title, subtitle } = payload
  let sortedSegmentsArray = sortSegments(Segments)
  let sortedChipsArray = sortChips(Chips)
  let smallestChipReq = smallestChipArray(sortedChipsArray, sortedSegmentsArray)
  var cumulativeDuration = 0
  var finishTime = new Date(0)
  var warningTime = new Date(0)
  var previousFinishTime = new Date(0)
  var nowValue = new Date().valueOf()
  var calculatedSegmentIndex = null
  var noticeStatus = false
  for (let i = 0, len = sortedSegmentsArray.length; i < len; i++) {
    if (Timers[0].active) {
      finishTime = new Date(sortedSegmentsArray[i].duration * 60000 + cumulativeDuration - Timers[0].elapsed + new Date(Timers[0].updatedAt).valueOf())
    } else {
      finishTime = new Date(sortedSegmentsArray[i].duration * 60000 + cumulativeDuration - Timers[0].elapsed + nowValue)
    }
    warningTime = new Date(finishTime - AppOptions.warningTime)
    sortedSegmentsArray[i].warningTime = warningTime
    sortedSegmentsArray[i].finishTime = finishTime
    if (finishTime.valueOf() >= nowValue && previousFinishTime.valueOf() < nowValue) {
      calculatedSegmentIndex = i
      noticeStatus = nowValue >= warningTime.valueOf() 
    }
    cumulativeDuration += sortedSegmentsArray[i].duration * 60000
    sortedSegmentsArray[i].cumulativeDuration = cumulativeDuration
    previousFinishTime = finishTime
  }
  if (calculatedSegmentIndex === null) calculatedSegmentIndex = sortedSegmentsArray.length - 1 
  return {
    title,
    subtitle,
    smallestChipReq,
    sortedSegmentsArray,
    sortedChipsArray,
    isActive: Timers[0].active,
    newCSI: calculatedSegmentIndex,
    lastSI: sortedSegmentsArray.length - 1,
    currentBlindsText: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex].sBlind.toString() + 
      "/" + sortedSegmentsArray[calculatedSegmentIndex].bBlind.toString() +
      (sortedSegmentsArray[calculatedSegmentIndex].ante > 0 ? " + " + sortedSegmentsArray[calculatedSegmentIndex].ante.toString() : ""))
      :"----/---- + ----",
    currentDurationMS: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex].duration * 60000)
      : 0,
    currentDurationText: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex].duration.toString() + 
      (sortedSegmentsArray[calculatedSegmentIndex].duration > 1 ? " Minutes" : "Minute"))
      : "--- Minutes",
    nextBlindsText: (calculatedSegmentIndex != null && calculatedSegmentIndex + 1 <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex +1 ].sBlind.toString() + 
      "/" + sortedSegmentsArray[calculatedSegmentIndex + 1].bBlind.toString() +
      (sortedSegmentsArray[calculatedSegmentIndex + 1].ante > 0 ? " + " + sortedSegmentsArray[calculatedSegmentIndex + 1].ante.toString() : ""))
      :"None",
    nextDurationText: (calculatedSegmentIndex != null && calculatedSegmentIndex + 1 <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex + 1].duration.toString() + 
      (sortedSegmentsArray[calculatedSegmentIndex + 1].duration > 1 ? " Minutes" : "Minute"))
      :"",
    currentSegmentFinishTime: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? sortedSegmentsArray[calculatedSegmentIndex].finishTime : null,
    currentSegmentNoticeTime: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? sortedSegmentsArray[calculatedSegmentIndex].finishTime - AppOptions.warningTime : null,
    currentSegmentCumulativeDuration:  (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? sortedSegmentsArray[calculatedSegmentIndex].cumulativeDuration : 0,
    timer: Timers[0],      
  }
}

const remainingTimeCalculator = (isActive, currentSegmentFinishTime, currentSegmentCumulativeDuration, elapsedFromDB) => {
  return isActive ? result = Math.max(new Date(currentSegmentFinishTime).valueOf() - new Date().valueOf() + 400, 0) : result =  Math.max(currentSegmentCumulativeDuration - elapsedFromDB + 400, 0)
}

const reducer =(state, action) => {
  let newState
  switch (action.type) {
    case 'SETUP': {
      const { isActive, title, smallestChipReq, timer, subtitle, sortedSegmentsArray, sortedChipsArray, newCSI, lastSI, currentBlindsText, currentDurationMS, currentDurationText, nextBlindsText, nextDurationText, currentSegmentFinishTime, currentSegmentNoticeTime, noticeStatus, currentSegmentCumulativeDuration, } = stateCalculator(action.payload)
      const remainingTimeMS = remainingTimeCalculator(isActive, currentSegmentFinishTime, currentSegmentCumulativeDuration, timer.elapsed)
      return {
        ...state,
        remainingTimeMS,
        title,
        smallestChipReq,
        timer,
        subtitle,
        isActive,
        newCSI,
        lastSI,
        currentBlindsText,
        currentDurationMS, 
        currentDurationText,
        nextBlindsText,
        nextDurationText,
        currentSegmentFinishTime,
        currentSegmentNoticeTime,
        noticeStatus,
        currentTime: new Date(),
        countdownText: msToTime(remainingTimeMS),
        sortedSegmentsArray,
        sortedChipsArray,
     }
    } 
    case 'END_OF_ROUND': {
      const { isActive, title, smallestChipReq, timer, subtitle, sortedSegmentsArray, sortedChipsArray, newCSI, lastSI, currentBlindsText, currentDurationMS, currentDurationText, nextBlindsText, nextDurationText, currentSegmentFinishTime, currentSegmentNoticeTime, noticeStatus, currentSegmentCumulativeDuration,} = stateCalculator(action.payload)
      const remainingTimeMS = remainingTimeCalculator(isActive, currentSegmentFinishTime, currentSegmentCumulativeDuration, timer.elapsed)
      return {
        ...state,
        remainingTimeMS,
        title,
        smallestChipReq,
        subtitle,
        timer,
        isActive,
        newCSI,
        lastSI,
        currentBlindsText,
        currentDurationMS, 
        currentDurationText,
        nextBlindsText,
        nextDurationText,
        currentSegmentFinishTime,
        currentSegmentNoticeTime,
        noticeStatus,
        currentTime: new Date(),
        // countdownText: msToTime(remainingTimeMS),
        sortedSegmentsArray,
        sortedChipsArray,
        }
    }
    case 'ONE_MINUTE_REMAINING': {
      return {
        ...state,
        noticeStatus: true,
        currentTime: new Date(),
      }
    }
    case 'TICK': {
      const remainingTimeMS = remainingTimeCalculator(state.isActive, state.currentSegmentFinishTime, state.currentSegmentCumulativeDuration, state.timer.elapsed)
      return {
        ...state,
        currentTime: new Date(),
        remainingTimeMS,
        // countdownText: msToTime(remainingTimeMS)
      }
    }
    default: {
      return {
        ...state,
      }
    }
  }
}

export const TournamentTimerScreen = (props) => {
  const [ playingSound, setPlayingSound] = useState(false)
  const [ toggleTournamentTimer ] = useMutation(UPDATE_TIMER_MUTATION, {})
  const [ jumpTournamentSegment ] = useMutation(JUMP_SEGMENT_MUTATION, {})
  const [ resetTournamentTimer ] = useMutation(RESET_TIMER_MUTATION, {})
  // const [ getServerTime] = useMutation(GET_SERVER_TIME_MUTATION, {})
  const { fontScale, width, height, scale } = useDimensions('screen')
  const { data, loading, error, } = useSubscription(TOURNAMENT_SUBSCRIPTION, { variables: { id: props.route.params.id}, onSubscriptionData: ({subscriptionData: {data}}) => {}})
  const [state, dispatch] = useReducer(reducer, initialState)
  const { newCSI, remainingTimeMS, lastSI, currentBlindsText, nextBlindsText, currentDurationMS, currentDurationText, nextDurationText, isActive, smallestChipReq, title,
          currentSegmentFinishTime, currentSegmentNoticeTime, noticeStatus, sortedSegmentsArray, sortedChipsArray, timer} = state

  useEffect(()=>{
    if (!data) {return}
    let {Tournament_by_pk} = data
    dispatch({type: 'SETUP', payload: Tournament_by_pk})
  }, [data])

  useEffect(()=> {
    let EORTimeout
    let speech = ""
    if (!currentSegmentFinishTime || !isActive) return
    EORTimeout = setTimeout(()=> {
      if (!playingSound) {
        if (newCSI == lastSI) {
          playSoundEffect("The tournament has reached the end of the final round.  The timer has been stopped.", 1.5, true)
          toggleTimerButtonPressed()
        } else {
          speech = "The blinds are now " + nextBlindsText.replace("k", " thousand ").replace("/", " and ").replace("false","").replace("+ ", "with an ante of ")
          dispatch({type: 'END_OF_ROUND', payload: data.Tournament_by_pk})
          playSoundEffect(speech, 1.5, true)
        }
      }
    }, new Date(currentSegmentFinishTime).valueOf() - new Date().valueOf())
    return () => {
      clearTimeout(EORTimeout)
    }
  }, [currentSegmentFinishTime, isActive])

  useEffect(()=> {
    let lastMinuteTimeOut
    if (!currentSegmentNoticeTime || !isActive) return
    lastMinuteTimeOut = setTimeout(()=> {
      dispatch({type: 'ONE_MINUTE_REMAINING'})
      if (!playingSound) playSoundEffect("Last minute of this round.", 3, true)
    }, new Date(currentSegmentNoticeTime).valueOf() - new Date().valueOf())
    return () => {
      clearTimeout(lastMinuteTimeOut)
    }
  }, [currentSegmentNoticeTime, isActive])

  useEffect(() => {
    let ticker
    if (isActive) {
      ticker = setInterval(()=> {
        dispatch({type: 'TICK'})
      }, AppOptions.timerUpdateInterval)
    }
    return ()=> {
      clearInterval(ticker)
    }
  }, [isActive])

  const playSoundEffect = async (customSpeech="", beepRate, playBeeps) => {
    try {
      const { sound: soundObject, status }  = await Audio.Sound.createAsync(
        require('../assets/sounds/3beeps.aiff'),
        {
          positionMillis: 0,
          volume: 0.7,
          rate: beepRate,
          shouldPlay: playBeeps,
          shouldCorrectPitch: false,
        },
        (playbackStatus) => {
          if (playbackStatus.didJustFinish) {
            Speech.speak(
              customSpeech,
              {
                rate: 1.00,
                pitch: 1,
                onDone: async () => {
                  setPlayingSound(false)
                  const { sound: soundObject, status }  = await Audio.Sound.createAsync(
                    require('../assets/sounds/500msSilence.mp3'),
                    {
                      rate: 4,
                      positionMillis: 0,
                      volume: 1,
                      shouldPlay: true,
                    },
                  )                 
                }
              }
            )
          }
        }
      )
    } catch (error) {
      setPlayingSound(false)
    }
  }

  useEffect(() => 
  {
    const animate = () => {
      chipFadeAnimation = new Animated.Value(1)
      Animated.loop(
        Animated.sequence([    
          Animated.timing(
            chipFadeAnimation,
            {
              toValue: 0.3,
              duration: 2500,
              useNativeDriver: true,
              isInteraction: false,
            }
          ),
          Animated.timing(
            chipFadeAnimation,
              {
                toValue: 0.7,
                duration: 2500, 
                useNativeDriver: true,
                isInteraction: false,
              }
          ),
        ])
      ).start()    
    }
    animate()
  },[data])
  
  toggleTimerButtonPressed = async ()=> {
    toggleTournamentTimer({
      variables: {
        id: timer.id,
        active: !(timer.active),
        elapsed: timer.elapsed + (timer.active ? new Date().valueOf() - new Date(timer.updatedAt).valueOf() : 0),
      },
      optimisticResponse: {
        update_Timer_by_pk: {
          id: timer.id,
          elapsed: timer.elapsed + (timer.active ? new Date().valueOf() - new Date(timer.updatedAt).valueOf() : 0),
          active: !(timer.active),
          updatedAt: new Date(),
        }
      }
    })
  }

  fwdButtonPressed = async () => {
    if (newCSI < lastSI) {
      jumpTournamentSegment({
        variables: {
          id: timer.id,
          elapsed: sortedSegmentsArray[newCSI].cumulativeDuration +1,
        },
        optimisticResponse: {
          update_Timer_by_pk: {
            id: timer.id,
            elapsed: sortedSegmentsArray[newCSI].cumulativeDuration +1,
            active: timer.active,
            updatedAt: new Date(),
          }
        },
      })
    } else {
    }
  }

  rwdButtonPressed = async () => {
    var elapsed = 0
    if (newCSI > 0) {
      if (remainingTimeMS >= sortedSegmentsArray[newCSI].duration*60000 - 10000) { 
        if (newCSI >= 2) {
          elapsed = sortedSegmentsArray[newCSI-2].cumulativeDuration + 1
        } else {
          elapsed = 0
        } 
      } else {
        elapsed = sortedSegmentsArray[newCSI-1].cumulativeDuration + 1
      }
    }
    jumpTournamentSegment({
      variables: {
        id: timer.id,
        elapsed,
      },
      optimisticResponse: {
        update_Timer_by_pk: {
          id: timer.id,
          elapsed,
          active: timer.active,
          updatedAt: new Date(),
        }
      },
    })
  }

  resetTimerButtonPressed = async () => {
    resetTournamentTimer({
      variables: {
        id: timer.id,
      },
      optimisticResponse: {
        update_Timer_by_pk: {
          id: timer.id,
          elapsed: 0,
          active: false,
          updatedAt: new Date(),
        }
      },
    })
  }

  useKeepAwake('timer')

  if (loading) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (data) {  
    const userIsOwner = true //dataUser && (dataUser.id == Tournament.user.id)
    const orientation = height > width ? 'portrait' : 'landscape'
    return (
      <AppLayout>
        <View style={[{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch'}]}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            <Text style={[{flex: 1}, styles.titleText, { textAlign: 'center'}]}>{title}</Text>
          </View>
          <LinearGradient
            colors={[ '#257a2f', '#194a2f', '#226a2f' ]}
            style={{ flex: 11, width: Math.min(height*14/9, width)*0.95, alignItems: 'stretch', margin: responsiveFontSize(1), padding: responsiveFontSize(1), borderRadius: responsiveFontSize(3) }}
          >
            <View style={{flex: 8, flexDirection:'row', }}>
              <View style={{flex: orientation == 'portrait' ? 0 : 1, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'flex-end', paddingLeft: 5}}>
                {orientation == 'landscape' && sortedChipsArray && sortedChipsArray.length > 0 && sortedChipsArray.map((u,i) => {
                  if (newCSI <= smallestChipReq[i].segment || smallestChipReq[i].segment < 0) {
                    return (
                      <Animated.View key={i} style={{flexDirection: 'row', alignItems: 'center', opacity: (newCSI + 1 <= smallestChipReq[i].segment) ? 1 : (chipFadeAnimation || 1) }}>
                        <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}  </Text>
                        <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(5)}/>
                      </Animated.View>
                    )
                  }
                })}
              </View>
              <View style={{flex: 4, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',}}>
                <View style={{flex: 2, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', }}>
                  <Text
                    style={[styles.blindsText, noticeStatus && styles.blindsNoticeText]}
                  >
                    {currentBlindsText}
                  </Text>
                  <Text
                    style={[styles.durationText, noticeStatus && styles.blindsNoticeText]}
                  >
                    {currentDurationText}
                  </Text>
                  </View>
                <View style={{flex: 8, flexDirection: 'column',  justifyContent: 'space-evenly', alignItems: 'center', }}>
                  <CircularProgress
                    value={remainingTimeMS}
                    radius={90}
                    duration={500}
                    progressValueColor={noticeStatus ? 'red' : '#ecf0f1'}
                    activeStrokeColor={noticeStatus ? 'red' : 'limegreen'}
                    initialValue={currentDurationMS}
                    maxValue={currentDurationMS}
                    progressFormatter={(remainingTimeMS) => {
                      'worklet'
                      return msToTime(remainingTimeMS)
                    }}
                  />
                </View>
                <View style={{flex: 4, flexDirection: 'column',  justifyContent: 'space-evenly', alignItems: 'center', }}>
                  <Text
                    style={[styles.nextBlindsText, noticeStatus && styles.nextBlindsNoticeText]}
                  >
                    {'Next Blinds: ' + nextBlindsText}
                  </Text>
                  <Text
                    style={[styles.nextBlindsText, noticeStatus && styles.nextBlindsNoticeText]}
                  >
                    {nextDurationText}
                  </Text>
                </View>
                { orientation == 'portrait' && userIsOwner &&
                  <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={() => resetTimerButtonPressed()}></Button>}
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-rewind' size={responsiveFontSize(3)}/>} onPress={()=> rwdButtonPressed()}></Button>}
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={ isActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={()=> toggleTimerButtonPressed()}></Button>}
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> fwdButtonPressed()}></Button>}
                  </View>
                }
              </View>
              <View style={{flex: orientation == 'portrait' ? 0 : 1, flexDirection: 'column', paddingRight: 5}}>
                { orientation == 'landscape' && userIsOwner &&
                  <View style={{flex: 2, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center'}}>
                    {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={()=> resetTimerButtonPressed()}></Button>}
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> rwdButtonPressed()}></Button>}
                    {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={ isActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={()=> toggleTimerButtonPressed()}></Button>}
                    {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> fwdButtonPressed()}></Button>}
                  </View>
                }
              </View>
            </View>
            {orientation == 'portrait' && 
              <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
                {sortedChipsArray && sortedChipsArray.length > 0 && sortedChipsArray.map((u,i) => {
                  if (newCSI <= smallestChipReq[i].segment || smallestChipReq[i].segment < 0) {
                    return (
                      <Animated.View key={i} style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center', opacity: (newCSI + 1 <= smallestChipReq[i].segment) ? 1 : (chipFadeAnimation || 1) }}>
                        <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(6)}/>
                        <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}</Text>
                      </Animated.View>
                    )
                  }
                })}
              </View>
            }
          </LinearGradient>
        </View>
      </AppLayout>
    )
  }
}

const styles = StyleSheet.create({
  blindsText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(12), responsiveWidth(12)),
  },
  durationText: {
    color: 'rgba(225, 225, 225, 1)',
    fontSize: Math.min(responsiveHeight(6), responsiveWidth(6)) 
  },
  anteText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)),
  },
  blindsNoticeText: {
    fontWeight: '300',
  },
  nextBlindsText: {
    color: 'rgba(150,150,150,1)',
    fontSize: Math.min(responsiveHeight(5), responsiveWidth(5)),
    textAlign: 'center',
  },
  nextBlindsNoticeText: {
    color: 'red',
  },
  timerText: {
    color: 'rgba(225,225,225,1)',
    fontFamily: 'Menlo',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)),
  },
  timerNoticeText: {
    color: 'red',
  },
  titleText: {
    fontSize: Math.min(responsiveHeight(4.5), responsiveWidth(4.5)),
    color: '#000',
  },
  chipText: {
    fontSize: responsiveFontSize(2.5),
    color: 'rgba(225,225,225,1)',
  }
})

export const TOURNAMENT_SUBSCRIPTION = gql`
  subscription TournamentSubscription($id: uuid!) {
    Tournament_by_pk(id: $id) {
    id
    title
    subtitle
    Chips {
      color
      denom
      id
      qtyAvailable
    }
    Segments {
      duration
      sBlind
      bBlind
      ante
      id
    }
    Costs {
      id
      price
      chipStack
      costType
    }
    Timers (limit: 1) {
      id
      active
      updatedAt
      createdAt
      elapsed
      oneMinuteRemainingSpeech
      playOneMinuteRemainingSound
      endOfRoundSpeech
      playEndOfRoundSound
      backgroundColor
      lastAccessed
    }
    Segments_aggregate {
      aggregate {
        sum {
          duration
        }
      }
    }
  }
}
`

export const UPDATE_TIMER_MUTATION = gql`
  mutation updateTimer($id: uuid!, $active: Boolean!, $elapsed: Int!) {
    update_Timer_by_pk(pk_columns: {id: $id}, _set: {active: $active, updatedAt: "=now()", elapsed: $elapsed, lastAccessed: "=now()"}) {
      id
      updatedAt
      active
      elapsed
    }
  }
`
export const JUMP_SEGMENT_MUTATION = gql`
  mutation advanceTimer($id: uuid!, $elapsed: Int!) {
    update_Timer_by_pk(pk_columns: {id: $id}, _set: {updatedAt: "=now()", elapsed: $elapsed, lastAccessed: "=now()"}) {
      id
      updatedAt
      active
      elapsed
    }
  }
`
export const RESET_TIMER_MUTATION = gql`
  mutation resetTimer($id: uuid!) {
    update_Timer_by_pk(pk_columns: {id: $id}, _set: {active: false, elapsed: "0", lastAccessed: "=now()", updatedAt: "=now()", }) {
      id
      updatedAt
      active
      elapsed
    }
  }
`
// export const GET_SERVER_TIME_MUTATION = gql`
//   mutation MyMutation ($id: uuid!) {
//     update_Timer_by_pk(pk_columns: {id: $id}, _set: {lastAccessed: "=now()"}) {
//       lastAccessed
//     }
//   }
// `