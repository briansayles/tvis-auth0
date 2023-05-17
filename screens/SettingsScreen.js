import * as React from 'react';
import { SafeAreaView, View, Platform, Alert, FlatList } from 'react-native';
import { Text, Button, } from 'react-native-elements'
import { gql} from '@apollo/client'
import { responsiveFontSize, styles } from '../styles'
import { AuthContext } from '../Contexts';
import { AppLayout } from '../components/AppLayout'

export function SettingsScreen(props) {
  const {redirect, userName} = React.useContext(AuthContext)
  const [name, setName] = React.useState("")
  React.useEffect(()=> { 
    const fetchName = async () => {
      setName(await userName())
    }
    fetchName()
  },[])
  return (
    <AppLayout>
      <SafeAreaView style={[styles.container, {justifyContent: 'space-between', alignItems: 'flex-start', marginHorizontal: responsiveFontSize(2)} ]}>
        <Text style={[ , {flex: 2, alignSelf: 'center'}]} h3>Profile</Text>
        <Text style={[ , {flex: 2, fontSize: responsiveFontSize(2)}]}>Logged in as: {name}</Text>
        {/* <Text style={[ , {flex: 1, fontSize: responsiveFontSize(2)}]}>Redirect URI: {redirect}</Text> */}
        <Text style={[ , {flex: 10, fontSize: responsiveFontSize(2)}]}>Sorry...not much to see here yet.</Text>
      </SafeAreaView>
    </AppLayout>
  );
}