import * as React from 'react';
import { SafeAreaView, View, Text, Button, Platform, Alert, FlatList } from 'react-native';
import { gql} from '@apollo/client'
import { Mutation, Subscription } from '@apollo/client/react/components';

import { styles } from '../styles'

export function TournamentsScreen() {
  return (
    <SafeAreaView style={[styles.container, {} ]}>
      <Text>Tournaments SCREEN</Text>
      <CreateTournamentMutation/>
      <CurrentUserTournamentsListSubscription/>
    </SafeAreaView>
  );
}

const CURRENT_USER_TOURNAMENTS_LIST_SUBSCRIPTION = gql`
  subscription currentUserTournamentListSubscription {
    current_user {
      user {
        tournaments_aggregate {
          aggregate {
            count
          }
        }
        tournaments {
          id
          title
        }
      }
    }
  }
`;

const CurrentUserTournamentsListSubscription = (props) => {
  const renderItem = ({ item }) => (
    <Text>{item.title}</Text>
  );
  return (
    <Subscription
      subscription={CURRENT_USER_TOURNAMENTS_LIST_SUBSCRIPTION} >
      {({ loading, error, data }) => {
        if (loading) return <Text>Loading</Text>
        if (error)
          return (
            <Text>
              Error in CURRENT_USER_TOURNAMENTS_LIST_QUERY
              {JSON.stringify(error, null, 2)}
            </Text>
          );
        if (data) {
          // console.log('\n'+JSON.stringify(data.current_user[0].user.tournaments)+'\n')
          return (
            <FlatList 
              data={data.current_user[0].user.tournaments}
              renderItem={renderItem}
              keyExtractor={(item)=> item.id.toString()}
            />
          )
        }
      }}
    </Subscription>
  )
};

const CREATE_TOURNAMENT_MUTATION = gql`
  mutation createTournament {
    insert_tournaments(objects: {
      title: "Default tournament title", 
      subtitle: "With default segments", 
      timers: {data: [{is_active: false}]}, 
      segments: {data: [
        {sBlind: 5, bBlind: 10, ante: 0, duration: 10}, 
        {sBlind: 10, bBlind: 10, ante: 2, duration: 10}]
      }, 
      chips: {data: [
        {color: "#fff", denom: 1}, 
        {color: "#f00", denom: 5}, 
        {color: "#0f0", denom: 25}, 
        {color: "#000", denom: 100}, 
        {color: "#f0f", denom: 500}
      ]}
    })
    { returning {
        id
        title
        subtitle
        is_public
        timers {
          is_active
        }
        segments {
          duration
          sBlind
          bBlind
          ante
        }
        chips {
          denom
          color
          text_color
          qty_available
        }
      }
    }
  }
`;

const CreateTournamentMutation = (props) => {
  return (
    <Mutation
      mutation={CREATE_TOURNAMENT_MUTATION}>
      {(createTournament, { loading, error, data }) => {
        if (loading) return <Text style={[styles.title]}>Creating your tournament...</Text>
    
        if (error)
          return (
            <Text>
              Error in CREATE_TOURNAMENT_MUTATION
              {JSON.stringify(error, null, 2)}
            </Text>
          );
        const dataEl = data ? (
          <Text style={[styles.title]}>{JSON.stringify(data, null, 2)}</Text>
        ) : null;
    
        return (
          <View >  
            <Button onPress={() => createTournament()} title="Create Tournament">
            </Button>
          </View>
        );
      }}
    </Mutation>
  )
};