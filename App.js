import * as React from 'react';
import { SafeAreaView, View, Text, Button, Platform, Alert, FlatList, LogBox } from 'react-native';
import * as SecureStore from 'expo-secure-store'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as AuthSession from 'expo-auth-session';
import jwtDecode from 'jwt-decode';
import { ApolloClient, ApolloProvider, createHttpLink, ApolloLink, HttpLink, from, split, execute, useQuery, useApolloClient, gql} from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache';
import { Query, Mutation, Subscription } from '@apollo/client/react/components';
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { GraphQLConfig, Auth0Config} from './config'
import { styles } from './styles'
import { Ionicons } from '@expo/vector-icons'

import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen} from './screens/SettingsScreen'
import { TournamentsScreen } from './screens/TournamentsScreen'
import { SignInScreen } from './screens/SignInScreen'
import { makeApolloClient } from './apolloClient'

const authorizationEndpoint = Auth0Config.authorizeURI
const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });
export const AuthContext = React.createContext()
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator()

export default function App({ navigation }) {
  React.useEffect(() => {
    LogBox.ignoreAllLogs(true)   
  }, [])
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await SecureStore.getItem('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        const request = await AuthSession.loadAsync(
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
        const result = await request.promptAsync(authorizationEndpoint, {useProxy})
        if (result.error) {
          Alert.alert(
            'Authentication error',
            result.params.error_description || 'something went wrong'
          );
          dispatch({type: 'SIGN_OUT'})
        }
        if (result.type === 'success') {
          const jwtToken = result.params.id_token;
          const decoded = jwtDecode(jwtToken);
          const { name, exp } = decoded;
          const expiry = new Date(exp*1000)
          if (expiry < Date.now()) {
            Alert.alert(
              'Token expired',
              'The authentication token has expired. Please re-login.'
            )
            dispatch({type: 'SIGN_OUT'})
          } 
          await SecureStore.setItemAsync('userToken', jwtToken.toString())
          await SecureStore.setItemAsync('expiry', expiry.toString())
          dispatch({ type: 'SIGN_IN', token: jwtToken });
        }
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync('userToken')
        dispatch({ type: 'SIGN_OUT' })
      },
    }),
    []
  );


  return (
    <AuthContext.Provider value={authContext}>
      <ApolloProvider client={makeApolloClient(state.userToken)}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = 'ios-home'
                } else if (route.name === 'Settings') {
                  iconName = 'ios-settings'
                } else if (route.name === 'Tournaments') {
                  iconName = 'ios-list'
                }
  
                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />
              },
            })}
            tabBarOptions={{
              activeTintColor: 'tomato',
              inactiveTintColor: 'gray',
            }}
          >
            {state.userToken == null ? (
              <>
                <Tab.Screen name="SignIn" component={SignInScreen} />
              </>
            ) : (
              <>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Tournaments" component={TournamentsStack} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
                </>
            )}
          </Tab.Navigator> 
        </NavigationContainer>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

function TournamentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tournaments" component={TournamentsScreen} />
    </Stack.Navigator>
  );
}
