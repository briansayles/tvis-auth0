import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import React, {useState} from 'react'
import { ActivityIndicator, Alert, View, ScrollView, RefreshControl, Pressable, SafeAreaView, } from 'react-native'
import { Text, Card, Button, Icon, } from 'react-native-elements';
import { styles, responsiveFontSize, responsiveWidth, responsiveHeight} from '../styles'
import { ErrorMessage } from '../components/ErrorMessage'
import { Ionicons } from '@expo/vector-icons'
import { SwipeableList } from '../components/SwipeableList'
import { AppLayout } from '../components/AppLayout'

import { smallestChipArray, sortSegments, sortChips, sortEntryFees, numberToSuffixedString, dictionaryLookup } from '../utilities/functions'

export function TournamentDashboardScreen (props) {
  const [refreshingState, setRefreshingState] = useState(false)
  const {data, loading, error, client, refetch} = useSubscription(TOURNAMENT_SUBSCRIPTION, {variables: {id: props.route.params.id}})
  const editButtonColor = dictionaryLookup("editButtonColor")
  const [ deleteSegment, {loading: deletingSegment, data: deleteSegmentData, error: deleteSegmentError} ] = useMutation(DELETE_SEGMENT_MUTATION, {})
  const deleteSegmentItem = ({id, sBlind, bBlind, ante}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + sBlind + '/' + bBlind + '/' + ante + 'level?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteSegment({variables: {id}})}, style: 'default'}])
  }
  const [ deleteChip, {loading: deletingChip, data: deleteChipData, error: deleteChipError} ] = useMutation(DELETE_CHIP_MUTATION, {})
  const deleteChipItem = ({id, denom, color}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + color + ', ' + denom + 'chips?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteChip({variables: {id}})}, style: 'default'}])
  }
  const [ deleteCost, {loading: deletingCost, data: deleteCostData, error: deleteCostError} ] = useMutation(DELETE_COST_MUTATION, {})
  const deleteCostItem = ({id, }) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + id + ' ?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteCost({variables: {id}})}, style: 'default'}])
  }
  const [ createSegment, {loading: creatingSegment, data: createSegmentData, error: createSegmentError} ] = useMutation(CREATE_SEGMENT_MUTATION, {})
  const createSegmentItem = () => {createSegment({variables: {tournament_id: data.tournaments_by_pk.id}})}
  const _navigateToTimerButtonPressed = (id) => {
    props.navigation.navigate('Details', {id: id})
  }

  // const _navigateToTimerEditorButtonPressed = (timer) => {
  //   props.navigation.navigate('TimerEdit', {timer})
  // }

  // const _navigateToSegmentList = (id) => {
  //   props.navigation.navigate('SegmentList', {id: id})
  // }

  // const _navigateToChipList = (id) => {
  //   props.navigation.navigate('ChipList', {id: id})
  // }

  // const _navigateToTableList = (id) => {
  //   props.navigation.navigate('TableList', {id: id})
  // }

  // const _navigateToPlayerList = (id) => {
  //   props.navigation.navigate('PlayerList', {id: id})
  // }

  // const _navigateToGeneralInfoEdit = (tourney) => {
  //   props.navigation.navigate('GeneralInfoEdit', {tourney: tourney})
  // }

  // const _navigateToCostList = (id) => {
  //   props.navigation.navigate('CostList', {id: id})
  // }

  // const _navigateToBuyList = (id) => {
  //   props.navigation.navigate('BuyList', {id: id})
  // }

  // const _navigateToPayoutLevelList = (id) => {
  //   props.navigation.navigate('PayoutSetup', {id: id})
  // }
  const deleting = deletingSegment || deletingChip || deletingCost
  const creating = false
  const createError = false
  const deleteError = deleteSegmentError || deleteChipError || deleteCostError

  if (loading || creating || deleting) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (createError) return (<ErrorMessage error={createError}/>)
  if (deleteError) return (<ErrorMessage error={deleteError}/>)
  if (data) {
    const Tournament = data.tournaments_by_pk
    const segments = sortSegments(Tournament.segments)
    const chips = sortChips(Tournament.chips)
    const smallestChipReq = smallestChipArray(chips, segments)
    return (
      <AppLayout>
          <SwipeableList 
            style={{}} // styles applied here will override the defaults
            headerTitle="Blinds Schedule" 
            data={segments}
            create={createSegmentItem}
            rightButton1={
              {
                backgroundColor:  'red',
                onPress: deleteSegmentItem,
                ioniconName: 'ios-trash'
              }
            }
            keyExtractor={(item)=> item.id.toString()}
            renderItem = {(data, rowMap) => {
              return(
                <Pressable style={[styles.rowFront, {}]} onPress={() => {editItem(data.item)}}>
                  <Text style={[, {flex: 4, }]}>{data.item.sBlind} / {data.item.bBlind} {data.item.ante > 0 ? ' + ' + data.item.ante + ' ante': ''}</Text>
                  <Text style={[, {flex: 2 ,textAlign: 'right', }]}>{data.item.duration} Minutes</Text>
                  <Text style={[, {flex: 0.25, }]}></Text>
                  <Ionicons name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
                </Pressable>
              )
            }}
          />
      </AppLayout>
    )
  }
}

const TOURNAMENT_QUERY = gql`
  query MyQuery($id: Int!) {
    tournaments_by_pk(id: $id) {
      id
      title
      subtitle
      is_public
      is_completed
      last_modified
      chips {
        color
        denom
        id
        qty_available
      }
      segments {
        duration
        sBlind
        bBlind
        ante
        id
      }
      costs {
        id
      }
      segments_aggregate {
        aggregate {
          sum {
            duration
          }
        }
      }
    }
  }
`
const TOURNAMENT_SUBSCRIPTION = gql`
  subscription TournamentSubscription($id: Int!) {
    tournaments_by_pk(id: $id) {
      id
      title
      subtitle
      is_public
      is_completed
      last_modified
      chips {
        color
        denom
        id
        qty_available
      }
      segments {
        duration
        sBlind
        bBlind
        ante
        id
      }
      costs {
        id
      }
      segments_aggregate {
        aggregate {
          sum {
            duration
          }
        }
      }
    }
  }
`

const DELETE_SEGMENT_MUTATION = gql`
  mutation MyMutation($id: Int!) {
    delete_segments(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`
const DELETE_CHIP_MUTATION = gql`
  mutation MyMutation($id: Int!) {
    delete_chips(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`
const DELETE_COST_MUTATION = gql`
  mutation MyMutation($id: Int!) {
    delete_costss(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`

const CREATE_SEGMENT_MUTATION = gql`
  mutation MyMutation($tournament_id: Int!, $sBlind: Int = 0, $duration: Int = 10, $bBlind: Int = 0, $ante: Int = 0) {
    insert_segments(objects: {tournament_id: $tournament_id, ante: $ante, bBlind: $bBlind, duration: $duration, sBlind: $sBlind}) {
      affected_rows
    }
  }
`