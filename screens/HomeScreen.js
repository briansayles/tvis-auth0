import { View, ActivityIndicator } from 'react-native'
import { Text, Button, Image, } from 'react-native-elements'
import * as React from 'react'
import { AuthContext } from '../Contexts'
import { styles, responsiveHeight, responsiveWidth } from '../styles'
import { AppLayout } from '../components/AppLayout'
import { useSubscription, gql } from '@apollo/client'

export function HomeScreen (props) {
  const {signOut, signIn} = React.useContext(AuthContext);
  const {loading, data, error} = useSubscription(USER_SUBSCRIPTION)
  const {userName} = React.useContext(AuthContext)
  const [name, setName] = React.useState("")
  React.useEffect(()=> { 
    const fetchName = async () => {
      setName(await userName())
    }
    fetchName()
  },[])
  if (error) return (<AppLayout><ErrorMessage error={error}/></AppLayout>)
  return (
    <AppLayout>
      <View style={[, {flex: 8, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center'}]}>
        <Image style={{width: responsiveWidth(50), height: responsiveWidth(50)}} source={require('../assets/icons/app-icon.png')} PlaceholderContent={<ActivityIndicator/>}/>
        <Text h3 style={{width: responsiveWidth(75), textAlign: 'center', paddingTop: responsiveHeight(2)}}>
          Live Poker Tournament design and management made EASY!!
        </Text>
      </View>
      {(data) && 
      <View style={[, {flex: 2, flexDirection: 'column', justifyContent: 'space-evenly'}]}>
      <Text>Logged in as: {name}</Text>
        <Button
          top={responsiveHeight(40)}
          title={"Log Out"}
          onPress={() => signOut()}
        />
      </View>
      }
      {(!data) && 
      <View style={[, {flex: 2, flexDirection: 'column', justifyContent: 'space-evenly'}]}>
        <Text>  </Text>
        <Button
          top={responsiveHeight(40)}
          title="Log In or Sign Up (FREE)"
          onPress={() => {signIn()}
          }
        />
      </View>
      }
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