// import { Auth0Config, } from './config'
// import { Platform, } from 'react-native'
// import * as AuthSession from 'expo-auth-session'
import * as React from 'react'
import * as Linking from 'expo-linking'

export const AuthContext = React.createContext()

export const authReducer = (prevState, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      // console.log('RESTORE_TOKEN')
      return {
        ...prevState,
        userToken: action.accessToken,
        refreshToken: action.refreshToken,
        tokenExpiry: action.tokenExpiry,
        idToken: action.idToken,
        isLoading: false,
      };
    case 'SIGN_IN':
      // console.log('SIGN_IN')
      return {
        ...prevState,
        isSignout: false,
        userToken: action.accessToken,
        refreshToken: action.refreshToken,
        idToken: action.idToken,
        tokenExpiry: action.tokenExpiry,
      };
    case 'SIGN_OUT':
      // console.log('SIGN_OUT')
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        refreshToken: null,
        tokenExpiry: null,
      };
    case 'REFRESH_TOKEN':
      // console.log('REFRESH_TOKEN')
      return {
        ...prevState,
        isSignout: false,
        userToken: action.accessToken,
        refreshToken: action.refreshToken,
        tokenExpiry: action.tokenExpiry,
      }
    default:
      return {
        ...prevState
      }
  }
}

export const authData = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  refreshToken: null,
  tokenExpiry: null,
  idToken: null,
}

export const redirectUri = Linking.createURL()
