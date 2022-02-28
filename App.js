import * as React from 'react'
import { Platform, Alert, } from 'react-native'
import { Audio } from 'expo-av'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as AuthSession from 'expo-auth-session'
import jwtDecode from 'jwt-decode'
import { ApolloProvider } from '@apollo/client'
import { Auth0Config} from './config'
import { Ionicons } from '@expo/vector-icons'

import { makeApolloClient } from './apolloClient'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen} from './screens/SettingsScreen'
import { TournamentsScreen } from './screens/TournamentsScreen'
import { SignInScreen } from './screens/SignInScreen'
import { TournamentDashboardScreen } from './screens/TournamentDashboardScreen'
import { TournamentTimerScreen}  from './screens/TournamentTimerScreen'
import { SegmentEditScreen } from './screens/SegmentEditScreen'
import { ChipEditScreen } from './screens/ChipEditScreen' 
import { CostEditScreen } from './screens/CostEditScreen'

// import { AuthContext } from './Contexts'

const authorizationEndpoint = Auth0Config.authorizeURI
const useProxy = Platform.select({ web: false, default: true })
const redirectUri = AuthSession.makeRedirectUri({ useProxy })

export const AuthContext = React.createContext()

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

export default function App({ navigation }) {
  React.useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: true,
      staysActiveInBackground: true,
    })
  }, [])
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          console.log(action.token)
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          console.log(action.token)
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
        userToken = await AsyncStorage.getItem('userToken');
        // userToken = await SecureStore.getItem('userToken');
        // After restoring token, we may need to validate it in production apps
        const decoded = jwtDecode(userToken);
        const { exp } = decoded;
        const expiry = new Date(exp*1000)
        if (expiry < Date.now()) {
          dispatch({type: 'SIGN_OUT'})
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: userToken });
        }
      } catch (e) {
        // Restoring token failed
      }
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
          await AsyncStorage.setItem('userToken', jwtToken.toString())
          // await SecureStore.setItemAsync('userToken', jwtToken.toString())
          await AsyncStorage.setItem('expiry', expiry.toString())
          // await SecureStore.setItemAsync('expiry', expiry.toString())
          dispatch({ type: 'SIGN_IN', token: jwtToken });
        }
      },
      signOut: async () => {
        await AsyncStorage.removeItem('userToken')
        await AsyncStorage.removeItem('expiry')
        // await SecureStore.deleteItemAsync('userToken')
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
                <Tab.Screen name="Sign In" component={SignInScreen} />
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
      <Stack.Screen name="Timer" component={TournamentTimerScreen}/>
      <Stack.Screen name="Segment Editor" component={SegmentEditScreen}/>
      <Stack.Screen name="Chip Editor" component={ChipEditScreen}/>
      <Stack.Screen name="Cost Editor" component={CostEditScreen}/>
    </Stack.Navigator>
  );
}