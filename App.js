import * as React from 'react'
import { Alert,} from 'react-native'
import { Audio } from 'expo-av'
import * as SecureStore from 'expo-secure-store'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as AuthSession from 'expo-auth-session'
import jwt_decode from 'jwt-decode'
import { ApolloProvider, } from '@apollo/client'
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
import { TimerEditScreen } from './screens/TimerEditScreen'
import { AuthContext, authReducer, authData, redirectUri, } from './Contexts'
import * as WebBrowser from 'expo-web-browser'
// import * as AuthSession from 'expo-auth-session'
// import { ResponseType, } from 'expo-auth-session';
import { AuthConfig } from './config'

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
      interruptionModeIOS: 0,
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
    bootstrapAsync = async () => {
      let userToken, refreshToken, idToken;
      try {
        userToken = await SecureStore.getItemAsync('userToken')
        // After restoring token, we may need to validate it in production apps
        const decoded = jwt_decode(userToken);
        const { exp } = decoded;
        const expiry = new Date(exp*1000)
        if (expiry < Date.now()) {
          dispatch({type: 'SIGN_OUT'})
        } else {
          // console.log(userToken)
          refreshToken = await SecureStore.getItemAsync('refreshToken')
          idToken = await SecureStore.getItemAsync('idToken')
          dispatch({ type: 'RESTORE_TOKEN', accessToken: userToken, idToken: idToken, refreshToken: refreshToken, tokenExpiry: expiry })
        }
      } catch (e) {
        // Restoring token failed
      }
    };
    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      redirect: redirectUri.toString(),
      signIn: async data => {
        const discoveryDocument = await AuthSession.fetchDiscoveryAsync(AuthConfig.discoveryURI)
        const request = await AuthSession.loadAsync(
          {
            responseType: AuthSession.ResponseType.Code,
            extraParams: {
              nonce: randomString(12),
            },
            clientId: AuthConfig.clientId,
            clientSecret: AuthConfig.clientSecret,
            usePKCE: false,
            scopes: ["openid", "profile", "offline_access"],
            redirectUri,
          }, discoveryDocument
        )
        const result = await request.promptAsync({})
        // console.log(result)
        if (result.error) {
          Alert.alert(
            'Authentication error',
            result.params.error_description || 'something went wrong'
          );
          dispatch({type: 'SIGN_OUT'})
        }
        if (result.type === 'success') {
          // console.log('success')
          // console.log(result.params.code)
          exchangeResult = await AuthSession.exchangeCodeAsync(
            {
              code: result.params.code,
              clientId: AuthConfig.clientId,
              clientSecret: AuthConfig.clientSecret,
              redirectUri,
            }, discoveryDocument
          )
          // console.log(exchangeResult)
          const jwtToken = JSON.stringify(exchangeResult.accessToken)
          const decoded = jwt_decode(jwtToken)
          const { sub, exp, id } = decoded
          const expiry = new Date(exp*1000)
          // console.log(expiry)
          if (expiry < Date.now()) {
            Alert.alert(
              'Token expired',
              'The authentication token has expired. Please re-login.'
            )
            dispatch({type: 'SIGN_OUT'})
          }
          await SecureStore.setItemAsync('userToken', jwtToken)
          await SecureStore.setItemAsync('expiry', expiry.toString())
          await SecureStore.setItemAsync('refreshToken', exchangeResult.refreshToken)
          await SecureStore.setItemAsync('idToken', exchangeResult.idToken)
          // console.log(jwtToken)
          dispatch({ type: 'SIGN_IN', accessToken: jwtToken, refreshToken: exchangeResult.refreshToken, idToken: exchangeResult.idToken, tokenExpiry: expiry });
        }
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync('userToken')
        await SecureStore.deleteItemAsync('expiry')
        dispatch({ type: 'SIGN_OUT' })
      },
      userName: async () => {
        try {
          const jwtToken = await SecureStore.getItemAsync('userToken')
          const decoded = jwt_decode(jwtToken)
          const { sub, exp } = decoded
          return sub
        } catch (e) {
          return null
        }
      },
      userId: async () => {
        try {
          const jwtToken = await SecureStore.getItemAsync('userToken')
          const decoded = jwt_decode(jwtToken)
          const {uid} = decoded
          return uid
        } catch (e) {
          return null
        } 
      }
    }),
    []
  );

  React.useEffect(()=>{
    // console.log(JSON.stringify(state))
    let refreshTokenTimeout
    let discoveryDocument
    let refreshResult
    if (state.refreshToken && state.tokenExpiry > new Date()) {
      // console.log('will refresh in ' + (state.tokenExpiry.valueOf() - new Date().valueOf() -60000) + ' ms')
      refreshTokenTimeout = setTimeout(async ()=>{
        // console.log('refreshTokenTimeout')
        discoveryDocument = await AuthSession.fetchDiscoveryAsync(AuthConfig.discoveryURI)
        refreshResult = await AuthSession.refreshAsync({
          responseType: AuthSession.ResponseType.Code,
          clientId: AuthConfig.clientId,
          clientSecret: AuthConfig.clientSecret,
          scopes: ["openid", "profile", "offline_access"],
          redirectUri,
          refreshToken: state.refreshToken
        },
          discoveryDocument)
        // console.log(refreshResult)
        if (refreshResult.accessToken) {
          // console.log('refreshResult.accessToken = ' & JSON.stringify(refreshResult.accessToken))
          const jwtToken = JSON.stringify(refreshResult.accessToken)
          const decoded = jwt_decode(jwtToken)
          const { sub, exp, id } = decoded
          const expiry = new Date(exp*1000)
          await SecureStore.setItemAsync('userToken', jwtToken)
          await SecureStore.setItemAsync('expiry', expiry.toString())
          await SecureStore.setItemAsync('refreshToken', refreshResult.refreshToken)
          dispatch({type: 'REFRESH_TOKEN', accessToken: jwtToken, tokenExpiry: expiry, refreshToken: refreshResult.refreshToken})
          // console.log(JSON.stringify(state))          
        } else {
          dispatch({type: 'SIGN_OUT'})
        }

      }, state.tokenExpiry.valueOf() - new Date().valueOf() -60000)
    }
    return (() => {
      // console.log('clearing old timeout')
      clearTimeout(refreshTokenTimeout)
    })
  }, [state])

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
      <Stack.Screen name="Entry Fee Editor" component={CostEditScreen}/>
      <Stack.Screen name="Timer Editor" component={TimerEditScreen}/>
    </Stack.Navigator>
  );
}