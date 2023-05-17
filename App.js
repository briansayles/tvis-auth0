import * as React from 'react'
import { Alert,} from 'react-native'
import { Audio } from 'expo-av'
import * as SecureStore from 'expo-secure-store'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as AuthSession from 'expo-auth-session'
import jwt_decode from 'jwt-decode'
import { ApolloProvider } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { makeApolloClient } from './apolloClient'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen} from './screens/SettingsScreen'
import { TournamentsScreen } from './screens/TournamentsScreen'
import { TournamentDashboardScreen } from './screens/TournamentDashboardScreen'
import { TournamentInfoEditScreen } from './screens/TournamentInfoEditScreen'
import { TournamentTimerScreen}  from './screens/TournamentTimerScreen'
import { SegmentEditScreen } from './screens/SegmentEditScreen'
import { ChipEditScreen } from './screens/ChipEditScreen' 
import { CostEditScreen } from './screens/CostEditScreen'
import { AuthContext, } from './Contexts'
import * as WebBrowser from 'expo-web-browser';
import { ResponseType, } from 'expo-auth-session';
import * as Linking from 'expo-linking'
import {authReducer, authData} from './authReducer'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()
WebBrowser.maybeCompleteAuthSession()

export default function App({ navigation }) {
  var randomString = function(length) {
    var text = "";
    var possible = "abcdefghijklmnopqrtsuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    for(var i = 0; i < length; i++) {
        text = possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  React.useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: 2,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 2,
      playThroughEarpieceAndroid: true,
      staysActiveInBackground: true,
    })
  }, [])

  const [state, dispatch] = React.useReducer(
    authReducer,
    authData
  )

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await SecureStore.getItemAsync('userToken')
        // After restoring token, we may need to validate it in production apps
        const decoded = jwt_decode(userToken);
        const { exp } = decoded;
        const expiry = new Date(exp*1000)
        if (expiry < Date.now()) {
          dispatch({type: 'SIGN_OUT'})
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: userToken })
        }
      } catch (e) {
        // Restoring token failed
      }
    };

    bootstrapAsync();
  }, []);
  const redirectUri = Linking.createURL()
  const authContext = React.useMemo(
    () => ({
      redirect: redirectUri.toString(),
      signIn: async data => {
        const request = await AuthSession.loadAsync(
          {
            responseType: ResponseType.Token,
            extraParams: {
              nonce: randomString(12),
            },
            clientId: "0oa9e8otx3qmfThsn5d7",
            scopes: ["openid", "profile"],
            redirectUri,
          }, "https://dev-08567763.okta.com/oauth2/default/"
          )
        const result = await request.promptAsync({})
        if (result.error) {
          Alert.alert(
            'Authentication error',
            result.params.error_description || 'something went wrong'
          );
          dispatch({type: 'SIGN_OUT'})
        }
        if (result.type === 'success') {
          const jwtToken = JSON.stringify(result.params.access_token)
          const decoded = jwt_decode(jwtToken)
          const { sub, exp } = decoded
          const expiry = new Date(exp*1000)
          if (expiry < Date.now()) {
            Alert.alert(
              'Token expired',
              'The authentication token has expired. Please re-login.'
            )
            dispatch({type: 'SIGN_OUT'})
          }
          // console.log('storing userToken:')
          // console.log(jwtToken)
          await SecureStore.setItemAsync('userToken', jwtToken)
          await SecureStore.setItemAsync('expiry', expiry.toString())
          dispatch({ type: 'SIGN_IN', token: jwtToken });
        }
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync('userToken')
        await SecureStore.deleteItemAsync('expiry')
        dispatch({ type: 'SIGN_OUT' })
      },
      userName: async () => {
        const jwtToken = await SecureStore.getItemAsync('userToken')
        const decoded = jwt_decode(jwtToken)
        const { sub, exp } = decoded
        console.log(sub)
        return sub
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
                } else if (route.name === 'Profile') {
                  iconName = 'ios-settings'
                } else if (route.name === 'Tournaments') {
                  iconName = 'ios-list'
                } else if (route.name ==='Sign In') {
                  iconName = 'log-in-outline'
                }
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
                <Tab.Screen name="Home" component={HomeScreen} />
              </>
            ) : (
              <>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Tournaments" component={TournamentsStack} />
                <Tab.Screen name="Profile" component={SettingsScreen} />
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
      <Stack.Screen name="Tournament Dashboard" component={TournamentDashboardScreen}/>
      <Stack.Screen name="Tournament Info Editor" component={TournamentInfoEditScreen}/>
      <Stack.Screen name="Timer" component={TournamentTimerScreen}/>
      <Stack.Screen name="Segment Editor" component={SegmentEditScreen}/>
      <Stack.Screen name="Chip Editor" component={ChipEditScreen}/>
      <Stack.Screen name="Cost Editor" component={CostEditScreen}/>
    </Stack.Navigator>
  );
}