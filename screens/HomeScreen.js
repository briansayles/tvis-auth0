import { SafeAreaView, View, ActivityIndicator } from 'react-native'
import { Text, Button, Image, } from 'react-native-elements'
import * as React from 'react'
import { AuthContext } from '../Contexts'
import { styles, responsiveHeight, responsiveWidth } from '../styles'
import { BannerAd } from '../components/Ads'
import { AppLayout } from '../components/AppLayout'
import {authReducer, authData} from '../authReducer'
import * as SecureStore from 'expo-secure-store'
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import { set } from 'react-native-reanimated'

export function HomeScreen (props) {
  const {signOut, signIn} = React.useContext(AuthContext);
  const {loading, data, error} = useSubscription(USER_SUBSCRIPTION)
  const [signingIn, setSigningIn] = React.useState(false)
  if (error) return (<AppLayout><ErrorMessage error={error}/></AppLayout>)
  return (
    <AppLayout>
      <View style={{alignItems: 'center'}}>
        <Image style={{width: responsiveWidth(50), height: responsiveWidth(50)}} source={require('../assets/icons/app-icon.png')} PlaceholderContent={<ActivityIndicator/>}/>
        <Text h3 style={{width: responsiveWidth(75), textAlign: 'center', paddingTop: responsiveHeight(2)}}>
          Live Poker Tournament design and management made EASY!!
        </Text>
      </View>
      {(data || signingIn)&& <Button
        top={responsiveHeight(40)}
        title={"Sign Out"}
        onPress={() => signOut()}
      />}
      {(!data && !signingIn) && <Button
        top={responsiveHeight(40)}
        title="Sign In or Sign Up (FREE)"
        onPress={() => {
          setSigningIn(true)
          signIn()
          setSigningIn(false)
          }
        }
      />}
    </AppLayout>
  );
}
const USER_SUBSCRIPTION = gql`
  subscription MySubscription {
    users {
      id
    }
  }
`