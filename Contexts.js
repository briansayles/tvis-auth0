import { Auth0Config, } from './config'
import { Platform, } from 'react-native'
import * as AuthSession from 'expo-auth-session'
import * as React from 'react'

export const authorizationEndpoint = Auth0Config.authorizeURI
export const useProxy = Platform.select({ web: false, default: true })
export const redirectUri = AuthSession.makeRedirectUri({ useProxy })

export const AuthContext = React.createContext()