import * as React from 'react';
import { SafeAreaView, View, Text, Button, Platform, Alert, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { gql, useQuery, useMutation, useSubscription} from '@apollo/client'
import { styles, responsiveFontSize } from '../styles'
import { ErrorMessage } from '../components/ErrorMessage'
import { Ionicons } from '@expo/vector-icons'
import { SwipeableList } from '../components/SwipeableList'

export function TournamentsScreen() {
	const {loading, data, error} = useSubscription(CURRENT_USER_TOURNAMENTS_LIST_SUBSCRIPTION)
  const [ createTournament, {loading: creating, data: createdData, error: createError} ] = useMutation(CREATE_TOURNAMENT_MUTATION, {})
  const [ deleteTournament, {loading: deleting, data: deleteData, error: deleteError} ] = useMutation(DELETE_TOURNAMENT_MUTATION, {})

  const navigateToTimerButtonPressed = ({id, title}) => {
    Alert.alert('Go to Timer', 'Go to timer for: \n' + title + '/n/n' + id + ' ?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}])
    // props.navigation.navigate('Details', {id: id})
  }
  const editItem = ({id, title}) => {
    Alert.alert('Confirm Edit', 'Edit: \n' + title + '\n\n' + id + ' ?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}])
  }
  const deleteItem = ({id, title}) => {
    Alert.alert('Confirm Delete', 'Delete: \n' + title + '\n\n' + id + ' ?', [{text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, {text: 'OK', onPress: ()=>{deleteTournament({variables: {id}})}, style: 'default'}])
  }
  const createItem = () => { createTournament() }
  if (loading || deleting) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (createError) return (<ErrorMessage error={createError}/>)
  if (deleteError) return (<ErrorMessage error={deleteError}/>)
  if (data) {
    return (
      <SafeAreaView style={[styles.container, {}]}>
        <SwipeableList 
          headerTitle="Tournaments" 
          data={data.current_user[0].user.tournaments} 
          create={createItem} 
          edit={editItem} 
          delete={deleteItem}
          keyExtractor={(item)=> item.id.toString()}
          rightButton1={
            {
              backgroundColor:  'red',
              onPress: deleteItem,
              ioniconName: 'ios-trash'
            }
          }
          rightButton2={
            {
              backgroundColor:  'forestgreen',
              onPress: navigateToTimerButtonPressed,
              ioniconName: 'ios-timer-outline'
            }
          }
          renderItem = {(data, rowMap) => {
            return(
              <Pressable style={[styles.rowFront, {}]} onPress={() => {editItem(data.item)}}>
                <Text style={[data.item.timers?.[0]?.is_active? styles.active : null, ]}>{data.item.title} {data.item.id}</Text>
                <Ionicons name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
              </Pressable>
            )
          }}
        />
      </SafeAreaView>
    )
  }
}

const CURRENT_USER_TOURNAMENTS_LIST_SUBSCRIPTION = gql`
  subscription currentUserTournamentListSubscription {
    current_user {
      user {
        tournaments ( order_by: {id: desc}) {
          id
          title
          timers (limit: 1) {
            is_active
            last_updated_at
          }
        }
      }
    }
  }
`;
const CREATE_TOURNAMENT_MUTATION = gql`
  mutation createTournament {
    insert_tournaments(objects: {
      title: "Default tournament title", 
      subtitle: "With default segments", 
      timers: {data: [
        {is_active: true}
      ]}, 
      segments: {data: [
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
      chips: {data: [
        {color: "#f00", denom: 5}, 
        {color: "#0f0", denom: 25}, 
        {color: "#000", denom: 100}, 
        {color: "#00f", denom: 500}
      ]},
    })
    { returning {
        id
        title
        timers (limit: 1) {
          is_active
          last_updated_at
        }
      }
    }
  }
`;

const DELETE_TOURNAMENT_MUTATION = gql`
  mutation MyMutation($id: Int!) {
    delete_tournaments(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`
