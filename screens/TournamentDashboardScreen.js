import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import React, {useState} from 'react'
import { ActivityIndicator, Alert, View, ScrollView, RefreshControl, Pressable, SafeAreaView, SectionList, TouchableOpacity} from 'react-native'
import { Text, Card, Button, Icon, } from 'react-native-elements';
import { styles, responsiveFontSize, responsiveWidth, responsiveHeight} from '../styles'
import { ErrorMessage } from '../components/ErrorMessage'
import { Ionicons } from '@expo/vector-icons'
import { SwipeableCollapsibleSectionList } from '../components/SwipeableList'
import { AppLayout } from '../components/AppLayout'
import { SwipeRow } from 'react-native-swipe-list-view'


import { smallestChipArray, sortSegments, sortChips, sortEntryFees, numberToSuffixedString, dictionaryLookup } from '../utilities/functions'

export function TournamentDashboardScreen (props) {
  const [refreshingState, setRefreshingState] = useState(false)

  const {data, loading, error, client, refetch} = useSubscription(TOURNAMENT_SUBSCRIPTION, {variables: {id: props.route.params.id}})
  const editButtonColor = dictionaryLookup("editButtonColor")
  const [ deleteSegment, {loading: deletingSegment, data: deleteSegmentData, error: deleteSegmentError} ] = useMutation(DELETE_SEGMENT_MUTATION, {})
  const deleteSegmentItem = ({id, sBlind, bBlind, ante}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + sBlind + '/' + bBlind + '/' + ante + ' level?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteSegment({variables: {id}})}, style: 'default'}])
  }
  const [ deleteChip, {loading: deletingChip, data: deleteChipData, error: deleteChipError} ] = useMutation(DELETE_CHIP_MUTATION, {})
  const deleteChipItem = ({id, denom}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + denom + ' chips?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteChip({variables: {id}})}, style: 'default'}])
  }
  const [ deleteCost, {loading: deletingCost, data: deleteCostData, error: deleteCostError} ] = useMutation(DELETE_COST_MUTATION, {})
  const deleteCostItem = ({id, cost_type: {long_name}, cost_amount}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + cost_amount.toLocaleString(undefined, {style: 'currency', currency: 'usd'}) + ' ' + long_name + '?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteCost({variables: {id}})}, style: 'default'}])
  }
  const [ createSegment, {loading: creatingSegment, data: createSegmentData, error: createSegmentError} ] = useMutation(CREATE_SEGMENT_MUTATION, {
    onCompleted: ({insert_segments_one}) => {
      editSegmentItem(insert_segments_one)
    },
  })
  const createSegmentItem = () => {createSegment({variables: {tournament_id: data.tournaments_by_pk.id}})}
  const [ createChip, {loading: creatingChip, data: createChipData, error: createChipError} ] = useMutation(CREATE_CHIP_MUTATION, {
    onCompleted: ({insert_chips_one}) => {
      editChipItem(insert_chips_one)
    },
  })
  const createChipItem = () => {createChip({variables: {tournament_id: data.tournaments_by_pk.id}})}
  const [ createCost, {loading: creatingCost, data: createCostData, error: createCostError} ] = useMutation(CREATE_COST_MUTATION, {
    onCompleted: ({insert_costs_one}) => {
      editCostItem(insert_costs_one)
    },
  })
  const createCostItem = () => {createCost({variables: {tournament_id: data.tournaments_by_pk.id}})}
  
  const editSegmentItem = (item) => { props.navigation.navigate('Segment Editor', {id: item.id})}
  const editChipItem = (item) => { props.navigation.navigate('Chip Editor', {id: item.id})}
  const editCostItem = (item) => { props.navigation.navigate('Cost Editor', {id: item.id})}

  const _navigateToTimerButtonPressed = (id) => {
    props.navigation.navigate('Details', {id: id})
  }

  // const _navigateToTimerEditorButtonPressed = (timer) => {
  //   props.navigation.navigate('TimerEdit', {timer})
  // }

  // const _navigateToGeneralInfoEdit = (tourney) => {
  //   props.navigation.navigate('GeneralInfoEdit', {tourney: tourney})
  // }

  const deleting = deletingSegment || deletingChip || deletingCost
  const creating = creatingSegment || creatingChip || creatingCost
  const createError = createSegmentError || createChipError || createCostError
  const deleteError = deleteSegmentError || deleteChipError || deleteCostError

  if (loading) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (createError) return (<ErrorMessage error={createError}/>)
  if (deleteError) return (<ErrorMessage error={deleteError}/>)
  if (data) {
    const Tournament = data.tournaments_by_pk
    const segments = sortSegments(Tournament.segments)
    const chips = sortChips(Tournament.chips)
    const costs = sortEntryFees(Tournament.costs)
    const smallestChipReq = smallestChipArray(chips, segments)
    const sectionListData = [
      { 
        key: 0,
        sectionIndex: 0,
        title: "Blinds Levels",
        data:   segments,
        includeCountInTitle: true,
        createFunction: createSegmentItem,
        onPressFunction: editSegmentItem,
        rightButtons: [
          {
            onPress: deleteSegmentItem,
            iconName: 'trash',
            backgroundColor: 'red',
          },
        ], 
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editSegmentItem(item)}}>
              <Text style={[ styles.bold, {flex: 0.5, textAlign: 'left'}]}>{index + 1}{collapsed ? 'C': ''}:</Text>
              <Text style={[ styles.bold, {flex: 4, }]}>{item.sBlind.toLocaleString()} / {item.bBlind.toLocaleString()} {item.ante > 0 ? ' + ' + item.ante.toLocaleString() + ' ante': ''}</Text>
              <Text style={[ , {flex: 2 ,textAlign: 'right', }]}>{item.duration.toLocaleString()} Minutes</Text>
              <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
            </Pressable>
          )
        }
      },
      {
        key: 1,
        sectionIndex: 1,
        title: "Chip Colors & Denominations",
        data: chips,
        includeCountInTitle: true,
        createFunction: createChipItem,
        onPressFunction: editChipItem,
        rightButtons: [
          {
            onPress: deleteChipItem,
            iconName: 'trash',
            backgroundColor: 'red',
          },
        ], 
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editChipItem(item)}}>
              <Text style={[ styles.bold, {flex: 2, color: item.color}]}>{item.denom}</Text>
              <Text style={[ , {flex: 4 ,textAlign: 'right', }]}>{item.qty_available ? item.qty_available.toLocaleString() : '0'} Available</Text>
              <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
            </Pressable>
          )
        }
      },
      {
        key: 2,
        sectionIndex: 2,
        title: "Entry Fees",
        data: costs,
        includeCountInTitle: true,
        createFunction: createCostItem,
        onPressFunction: editCostItem,
        rightButtons: [
          {
            onPress: deleteCostItem,
            iconName: 'trash',
            backgroundColor: 'red',
          },
        ], 
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editCostItem(item)}}>
              <Text style={[ , {flex: 4, color: item.color}]}>{item.cost_amount.toLocaleString(undefined, {style: 'currency', currency: 'usd'})} {item.cost_type.long_name}</Text>
              <Text style={[ , {flex: 2 ,textAlign: 'right', }]}>{item.cost_chipstack.toLocaleString()} chips</Text>
              <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
             </Pressable>
          )
        }
      },
    ]
    return (
      <AppLayout>
        <SwipeableCollapsibleSectionList
          sections={sectionListData}
        />
      </AppLayout>
    )
  }
}

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
        cost_amount
        cost_chipstack
        cost_type {
          long_name
        }
      }
      timers (limit: 1) {
        is_active
        last_updated_at
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
  mutation DeleteSegment($id: Int!) {
    delete_segments(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`
const DELETE_CHIP_MUTATION = gql`
  mutation DeleteChip($id: Int!) {
    delete_chips(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`
const DELETE_COST_MUTATION = gql`
  mutation DeleteCost($id: Int!) {
    delete_costs(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`

const CREATE_SEGMENT_MUTATION = gql`
  mutation CreateSegment($tournament_id: Int!, $sBlind: Int = 0, $duration: Int = 10, $bBlind: Int = 0, $ante: Int = 0) {
    insert_segments_one(object: {tournament_id: $tournament_id, ante: $ante, bBlind: $bBlind, duration: $duration, sBlind: $sBlind}) {
      id
    }
  }
`

const CREATE_CHIP_MUTATION = gql`
  mutation CreateChip($tournament_id: Int!, $color: String = "#fff", $denom: Int = 1, $qty_available: Int = 100, ) {
    insert_chips_one(object: {tournament_id: $tournament_id, denom: $denom, qty_available: $qty_available, color: $color}) {
      id
    }
  }
`
const CREATE_COST_MUTATION = gql`
  mutation CreateCost($cost_amount: numeric = 20, $cost_chipstack: Int = 1000, $cost_type_name: cost_types_enum = Buyin, $tournament_id: Int!) {
    insert_costs_one(object: {cost_amount: $cost_amount, cost_chipstack: $cost_chipstack, cost_type_name: $cost_type_name, tournament_id: $tournament_id}) {
      id
    }
  }
`