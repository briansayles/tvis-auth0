import React, {useState} from 'react'
import { SafeAreaView, View, Platform, Alert, FlatList, ActivityIndicator, Pressable, SectionList, TouchableOpacity} from 'react-native';
import { Text, Button, } from 'react-native-elements'
import { gql, useQuery, useMutation, useSubscription} from '@apollo/client'
import { styles, responsiveFontSize, } from '../styles'
import { ErrorMessage } from '../components/ErrorMessage'
import { Ionicons } from '@expo/vector-icons'
import { SwipeableList, SwipeableCollapsibleSectionList} from '../components/SwipeableList'
import { AppLayout } from '../components/AppLayout'
import { SwipeRow } from 'react-native-swipe-list-view'


export function TournamentsScreen(props) {

  const {loading, data, error} = useSubscription(CURRENT_USER_TOURNAMENTS_LIST_SUBSCRIPTION)
  const [ collapsedState, setCollapsedState] = useState(false)
  const [ createTournament, {loading: creating, data: createdData, error: createError} ] = useMutation(CREATE_TOURNAMENT_MUTATION, {})
  const createItem = () => { createTournament() }
  const [ deleteTournament, {loading: deleting, data: deleteData, error: deleteError} ] = useMutation(DELETE_TOURNAMENT_MUTATION, {})
  const deleteItem = ({id, title}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + title + '\n\n' + id + ' ?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteTournament({variables: {id}})}, style: 'default'}])
  }
  const editItem = ({id, title}) => {
    props.navigation.navigate('Tournament Dashboard', {id: id})
  }
  
  const navigateToTimerButtonPressed = ({id, title, Timers} ) => {
    props.navigation.navigate('Timer', {id: id, timerId: Timers[0].id })
  }

  React.useEffect(()=> {
    if (data?.tournaments?.length == 0) {
      const createFirstTournament = async () => {
        Alert.alert(
          'Creating your first tournament', 
          'Since You don\'t have any tournaments right now, we\'re going to create one for you to get you started.\n\nOnce it\'s done, just tap on it to edit it to your liking.', 
          [
            {
              text: 'Got it. Thanks!', 
              onPress: ()=>{
                createItem() 
              },
              style: 'default'
            }
          ]
        )
      }
      createFirstTournament()
    }
  }, [data])

  if (loading) return (<AppLayout><ActivityIndicator/></AppLayout>)
  if (error) return (<AppLayout><ErrorMessage error={error}/></AppLayout>)
  if (createError) return (<AppLayout><ErrorMessage error={createError}/></AppLayout>)
  if (deleteError) return (<AppLayout><ErrorMessage error={deleteError}/></AppLayout>)
  if (data) {

    const sectionListData = [
      {
        key: 0,
        sectionIndex: 0,
        title: "My Tournaments",
        data:   data.tournaments,
        includeCountInTitle: true,
        createFunction: createItem,
        onPressFunction: editItem,
        deleteFunction: deleteItem,
        rightButtons: [
        //   {
        //     onPress: deleteItem,
        //     iconName: 'trash',
        //     backgroundColor: 'red',
        //   },
        //   {
        //     onPress: navigateToTimerButtonPressed,
        //     iconName: 'ios-timer-outline',
        //     backgroundColor: 'forestgreen',
        //   },
        ], 
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editItem(item)}}>
              <Text style={[item.Timers[0]?.is_active? styles.active : null, {}]}>{item.title}</Text>
              <Text style={[item.Timers[0]?.is_active? styles.active : null, {}]}>{item.subtitle}</Text>
              {/* <Ionicons iconStyle={{flex: 2}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/> */}
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

const CURRENT_USER_TOURNAMENTS_LIST_SUBSCRIPTION = gql`
  subscription currentUserTournamentListSubscription {
    tournaments(order_by: {updated_at: desc_nulls_last}) {
      id
      title
      subtitle
      Timers (limit: 1) {
        id
        active
      }
    }
  }
`

const CREATE_TOURNAMENT_MUTATION = gql`
  mutation createTournament {
    insert_tournaments_one(object: {
      title: "Default tournament title", 
      subtitle: "With default segments", 
      Timers: {data: [
        {active: false}
      ]}, 
      Segments: {data: [
        {sBlind: 5, bBlind: 10, ante: 0, duration: 10}, 
        {sBlind: 10, bBlind: 20, ante: 0, duration: 10},
        {sBlind: 15, bBlind: 30, ante: 0, duration: 10}, 
        {sBlind: 20, bBlind: 40, ante: 0, duration: 10},
        {sBlind: 30, bBlind: 60, ante: 0, duration: 10}, 
        {sBlind: 40, bBlind: 80, ante: 0, duration: 10},
        {sBlind: 50, bBlind: 100, ante: 10, duration: 10},
        {sBlind: 75, bBlind: 150, ante: 15, duration: 10}, 
        {sBlind: 100, bBlind: 200, ante: 20, duration: 10},
        {sBlind: 150, bBlind: 300, ante: 30, duration: 10}, 
        {sBlind: 200, bBlind: 400, ante: 40, duration: 10},
        {sBlind: 300, bBlind: 600, ante: 60, duration: 10}, 
        {sBlind: 400, bBlind: 800, ante: 80, duration: 10},
        {sBlind: 500, bBlind: 1000, ante: 100, duration: 10},
      ]}, 
      Chips: {data: [
        {color: "#f00", denom: 5}, 
        {color: "#0f0", denom: 25}, 
        {color: "#000", denom: 100}, 
        {color: "#00f", denom: 500}
      ]},
    })
    { 
      id
      title
      Timers(limit: 1) {
        active
        updated_at
      }
    }
  }
`

const DELETE_TOURNAMENT_MUTATION = gql`
  mutation DeleteTournament($id: uuid!) {
    delete_tournaments_by_pk(id: $id) {
      id
    }
  }
`