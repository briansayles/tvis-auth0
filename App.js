import * as AuthSession from 'expo-auth-session';
import jwtDecode from 'jwt-decode';
import * as React from 'react';
import { Alert, Button, Platform, StyleSheet, Text, View, ScrollView, FlatList, SafeAreaView} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ApolloClient, ApolloProvider, createHttpLink, ApolloLink, HttpLink, from, split, execute, useQuery, useApolloClient, gql} from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache';
import { Query, Mutation, Subscription } from '@apollo/client/react/components';
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { GraphQLConfig, Auth0Config} from './config'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const authorizationEndpoint = Auth0Config.authorizeURI

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const makeApolloClient = (token) => {
  const httpLink = new HttpLink({
    uri: "https://" + GraphQLConfig.endpoint,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });  
  const wsLink = new WebSocketLink(new SubscriptionClient(
    "wss://"+GraphQLConfig.endpoint, {
    reconnect: true,
    connectionParams: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }));
  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  );
  const cache = new InMemoryCache()
  const client = new ApolloClient({
    link,
    cache
  });
  return client;
}

function HomeScreen() {
  const [token, setToken] = React.useState(null)
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: Auth0Config.clientId,
      responseType: 'code token id_token',
      scopes: ['openid', 'profile', 'email', 'read:client_grants'],
      extraParams: {
        nonce: 'nonce',
      },
      audience: Auth0Config.audience
    },
    { authorizationEndpoint }
  )

  React.useEffect(() => {
    if (result) {
      if (result.error) {
        Alert.alert(
          'Authentication error',
          result.params.error_description || 'something went wrong'
        );
        return;
      }
      if (result.type === 'success') {
        const jwtToken = result.params.id_token;
        setToken(jwtToken)
        const decoded = jwtDecode(jwtToken);
        const { name, exp } = decoded;
        const expiry = new Date(exp*1000)
        async function storeToken() {
          // await SecureStore.setItemAsync('token', jwtToken)
          await SecureStore.setItemAsync('expiry', expiry.toString())
        }
        storeToken()
      }
    }
  }, [result])

 return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
      {token ? (
        <ApolloProvider client={makeApolloClient(token)}>
          <Button title="Log out" onPress={async () => {
            setToken(null)
            // await SecureStore.deleteItemAsync('token')
            await SecureStore.deleteItemAsync('expiry')
          }}/>
        </ApolloProvider>
      ) : (
        <Button
          disabled={!request}
          title="Log in with Auth0"
          onPress={() => promptAsync({ useProxy })}
        />
      )}
   </SafeAreaView>
  )
}

function TournamentsScreen() {
 return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Tournaments</Text>
   </SafeAreaView>
  )
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  )
}

export default function App() {
  async function isLoggedIn () {
    const expiry = await SecureStore.getItemAsync("expiry") || 0
    console.log(expiry)
    const result = expiry > Date.now()
    console.log(result)
    return result
  }  
  
  
  const Tab = createBottomTabNavigator()

  return (
      <NavigationContainer>
        <Tab.Navigator>
          {isLoggedIn ? (
            <>
              <Tab.Screen name="Home" component={HomeScreen} />
            </>
          ): (
            <>
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Tournaments" component={TournamentsScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </>
          )}
        </Tab.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});

const ALL_USERS_QUERY = gql`
  query allUsers {
    users {
      id
      name
    }
  }
`;

const AllUsersQuery = (props) => {
  return (
    <Query
      query={ALL_USERS_QUERY} >
      {({ loading, error, data }) => {
        if (loading) return <Text>Loading</Text>
        if (error)
          return (
            <Text>
              Error in ALL_USERS_QUERY
              {JSON.stringify(error, null, 2)}
            </Text>
          );
    
        if (data) {
          return (
            <Text>{JSON.stringify(data, null, 2)}</Text>
          )
        }
      }}
    </Query>
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
const CURRENT_USER_TOURNAMENTS_LIST_QUERY = gql`
  query currentUserTournamentsList {
    current_user {
      user {
        tournaments {
          id
          title
        }
      }
    }
  }
`;

const CurrentUserTournamentsListQuery = (props) => {
  const renderItem = ({ item }) => (
    <Text>{item.title}</Text>
  );
  return (
    <Query
      query={CURRENT_USER_TOURNAMENTS_LIST_QUERY} >
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
    </Query>
  )
};
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