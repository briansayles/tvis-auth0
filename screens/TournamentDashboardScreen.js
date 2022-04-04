import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import React, {useState, useEffect} from 'react'
import { ActivityIndicator, Alert, View, ScrollView, RefreshControl, Pressable, SafeAreaView, SectionList, TouchableOpacity} from 'react-native'
import { Text, Card, Button, Icon, } from 'react-native-elements';
import { styles, responsiveFontSize, responsiveWidth, responsiveHeight} from '../styles'
import { ErrorMessage } from '../components/ErrorMessage'
import { Ionicons } from '@expo/vector-icons'
import { SwipeableCollapsibleSectionList } from '../components/SwipeableList'
import { AppLayout } from '../components/AppLayout'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { SwipeRow } from 'react-native-swipe-list-view'


import { smallestChipArray, sortSegments, sortChips, sortEntryFees, numberToSuffixedString, dictionaryLookup } from '../utilities/functions'

export function TournamentDashboardScreen (props) {
  const [refreshingState, setRefreshingState] = useState(false)
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)

  const {data, loading, error, client, refetch} = useSubscription(TOURNAMENT_SUBSCRIPTION, {variables: {id: props.route.params.id}})

  const navigateToTimerButtonPressed = ({id, title, Timers} ) => {
    props.navigation.navigate('Timer', {id: id, timerId: Timers[0].id })
  }
  const [deleteTournament, {loading: deletingTournament, data: deleteTournamentData, error: deleteTournamentError}] = useMutation(DELETE_TOURNAMENT_MUTATION)
  const deleteItem = ({id, title}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + title + ' ?', 
    [
      {text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, 
      {text: 'OK', onPress: async ()=> {
        await deleteTournament({variables: {id}})
        props.navigation.navigate("Tournaments")
      }, style: 'default'
      }
    ])
  }
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
  const deleteCostItem = ({id, costType, price}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + price.toLocaleString(undefined, {style: 'currency', currency: 'usd'}) + ' ' + dictionaryLookup(costType, "EntryFeeOptions", "long") + '?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteCost({variables: {id}})}, style: 'default'}])
  }
  const [ createSegment, {loading: creatingSegment, data: createSegmentData, error: createSegmentError} ] = useMutation(CREATE_SEGMENT_MUTATION, {
    onCompleted: ({insert_Segment_one}) => {
      editSegmentItem(insert_Segment_one)
    },
  })
  const createSegmentItem = () => {createSegment({variables: {tournamentId: data.Tournament_by_pk.id}})}
  const [ createChip, {loading: creatingChip, data: createChipData, error: createChipError} ] = useMutation(CREATE_CHIP_MUTATION, {
    onCompleted: ({insert_Chip_one}) => {
      editChipItem(insert_Chip_one)
    },
  })
  const createChipItem = () => {createChip({variables: {tournamentId: data.Tournament_by_pk.id}})}
  const [ createCost, {loading: creatingCost, data: createCostData, error: createCostError} ] = useMutation(CREATE_COST_MUTATION, {
    onCompleted: ({insert_Cost_one}) => {
      editCostItem(insert_Cost_one)
    },
  })
  const createCostItem = () => {createCost({variables: {tournamentId: data.Tournament_by_pk.id}})}
  
  const editSegmentItem = (item) => { props.navigation.navigate('Segment Editor', {id: item.id})}
  const editChipItem = (item) => { props.navigation.navigate('Chip Editor', {id: item.id})}
  const editCostItem = (item) => { props.navigation.navigate('Cost Editor', {id: item.id})}

  useEffect(()=>{
    if (data) {
      setInitialValues(data.Tournament_by_pk)
      setFormValues(data.Tournament_by_pk)
    }
  },[data])
  
  const [updateTournament] = useMutation(UPDATE_TOURNAMENT_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  const handleInputChange = (fieldName, value) => {
    setFormValues({...formValues, [fieldName]:value})
  }

  const isDirty = () => {
    let result = false
    try {
      Object.keys(formValues).forEach((key, index) => { if (formValues[key] !== initialValues[key]) result = true })
    } catch {}
    return result
  }
  const deleting = deletingSegment || deletingChip || deletingCost || deletingTournament
  const creating = creatingSegment || creatingChip || creatingCost
  const createError = createSegmentError || createChipError || createCostError
  const deleteError = deleteSegmentError || deleteChipError || deleteCostError

  if (loading || deletingTournament || deleteTournamentData) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (createError) return (<ErrorMessage error={createError}/>)
  if (deleteError) return (<ErrorMessage error={deleteError}/>)
  if (data) {
    const Tournament = data.Tournament_by_pk
    const segments = sortSegments(Tournament.Segments)
    const chips = sortChips(Tournament.Chips)
    const costs = sortEntryFees(Tournament.Costs)
    const smallestChipReq = smallestChipArray(chips, segments)
    const sectionListData = [
      {
        key: 0,
        sectionIndex: 0,
        title: Tournament.Timers[0].active ? "TIMER (Running) " : "TIMER (Stopped)",
        titleStyles: [styles.green],
        data: [Tournament],
        initiallyCollapsed: false,
        includeCountInTitle: false,
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {navigateToTimerButtonPressed(item)}}>
              <Text style={[ styles.bold, styles.green, {flex: 6 ,textAlign: 'left', }]}>GO TO TIMER</Text>
              <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
            </Pressable>
          )
        } 
      },
      {
        key: 1,
        sectionIndex: 1,
        title: "",
        titleStyles: [],
        data: [],
        initiallyCollapsed: true,
        includeCountInTitle: false,
        rightButtons: [],
        renderFrontRow: () => {return null}
      },
      { 
        key: 2,
        sectionIndex: 2,
        title: "Tournament Info",
        titleStyles: [],
        data: [Tournament],
        initiallyCollapsed: true,
        includeCountInTitle: false,
        createFunction: null,
        onPressFunction: ()=>{},
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return (
            <FormView contentContainerStyle={[collapsed ? styles.collapsed : null, {} ]} >
              <MyInput
                title="Title"
                value={(formValues?.title ? formValues.title : "")}
                placeholder="Enter tournament title here..."
                onChangeText={(text) => handleInputChange('title', text)}
                keyboardType="default"
              />
              <MyInput
                title="Subtitle"
                value={(formValues?.subtitle ? formValues.subtitle : "")}
                placeholder="Enter tournament subtitle here..."
                onChangeText={(text) => handleInputChange('subtitle', text)}
                keyboardType="default"
              />
              <SubmitButton 
                mutation={updateTournament}
                disabled={!isDirty()}
              />
            </FormView>            
          )
        }
      },
      {
        key: 3,
        sectionIndex: 3,
        title: "Entry Fees",
        titleStyles: [],
        data: costs,
        initiallyCollapsed: true,
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
              <Text style={[ , {flex: 4, }]}>{item.price.toLocaleString(undefined, {style: 'currency', currency: 'usd'})} {dictionaryLookup(item.costType, "EntryFeeOptions", "long")}</Text>
              <Text style={[ , {flex: 2 ,textAlign: 'right', }]}>{item.chipStack.toLocaleString()} chips</Text>
              <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
             </Pressable>
          )
        }
      },
      { 
        key: 4,
        sectionIndex: 4,
        title: "Blinds Levels",
        titleStyles: [],
        data:   segments,
        initiallyCollapsed: true,
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
        key: 5,
        sectionIndex: 5,
        title: "Chip Colors & Denominations",
        titleStyles: [],
        data: chips,
        initiallyCollapsed: true,
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
              <Text style={[ , {flex: 4 ,textAlign: 'right', }]}>{item.qtyAvailable ? item.qtyAvailable.toLocaleString() : '0'} Available</Text>
              <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
            </Pressable>
          )
        }
      },
      {
        key: 6,
        sectionIndex: 6,
        title: "",
        titleStyles: [],
        data: [],
        initiallyCollapsed: true,
        includeCountInTitle: false,
        rightButtons: [],
        renderFrontRow: () => {return null}
      },
      {
        key: 7,
        sectionIndex: 7,
        title: "DELETE",
        titleStyles: [styles.red],
        data: [Tournament],
        initiallyCollapsed: true,
        includeCountInTitle: false,
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {deleteItem(item)}}>
              <Text style={[ styles.bold, styles.red, {flex: 6 ,textAlign: 'left', }]}>DELETE THIS TOURNAMENT</Text>
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

const UPDATE_TOURNAMENT_MUTATION = gql`
  mutation UpdateTournament($id: uuid!, $subtitle: String = "", $title: String = "") {
    update_Tournament_by_pk(pk_columns: {id: $id}, _set: {title: $title, subtitle: $subtitle}) {
      id
      subtitle
      title
    }
  }
`

const TOURNAMENT_SUBSCRIPTION = gql`
  subscription TournamentSubscription($id: uuid!) {
    Tournament_by_pk(id: $id) {
      id
      title
      subtitle
      Segments {
        duration
        sBlind
        bBlind
        ante
        id
      }
      Timers (limit: 1) {
        active
        updatedAt
        id
      }
      Segments_aggregate {
        aggregate {
          sum {
            duration
          }
        }
      }
      Costs {
        chipStack
        costType
        price
        id
      }
      Chips {
        color
        denom
        qtyAvailable
        id
      }
    }
  }
`
const DELETE_TOURNAMENT_MUTATION = gql`
  mutation MyMutation($id: uuid!) {
    delete_Tournament_by_pk(id: $id) {
      id
    }
  }
`


const DELETE_SEGMENT_MUTATION = gql`
  mutation DeleteSegment($id: uuid!) {
    delete_Segment_by_pk(id: $id) {
      id
    }
  }
`
const DELETE_CHIP_MUTATION = gql`
  mutation DeleteChip($id: uuid!) {
    delete_Chip_by_pk(id: $id) {
      id
    }
  }
`
const DELETE_COST_MUTATION = gql`
  mutation DeleteCost($id: uuid!) {
    delete_Cost_by_pk(id: $id) {
      id
    }
  }
`

const CREATE_SEGMENT_MUTATION = gql`
  mutation CreateSegment($tournamentId: uuid!, $sBlind: Int = 0, $duration: Int = 10, $bBlind: Int = 0, $ante: Int = 0, ) {
    insert_Segment_one(object: {tournamentId: $tournamentId, ante: $ante, bBlind: $bBlind, duration: $duration, sBlind: $sBlind}) {
      id
    }
  }
`

const CREATE_CHIP_MUTATION = gql`
  mutation CreateChip($tournamentId: uuid!, $color: String = "#fff", $denom: Int = 1, $qtyAvailable: Int = 100, ) {
    insert_Chip_one(object: {tournamentId: $tournamentId, denom: $denom, qtyAvailable: $qtyAvailable, color: $color}) {
      id
    }
  }
`
const CREATE_COST_MUTATION = gql`
  mutation CreateCost($tournamentId: uuid!, $price: Float = 20, $chipStack: Int = 1000, $costType: Cost_Type_enum = Buyin, ) {
    insert_Cost_one(object: {tournamentId: $tournamentId, price: $price, chipStack: $chipStack, costType: $costType, }) {
      id
    }
  }
`