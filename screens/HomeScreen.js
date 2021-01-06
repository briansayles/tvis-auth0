import { SafeAreaView, Text, Button } from 'react-native'
import * as React from 'react'
import { AuthContext } from '../App'
import { styles } from '../styles'

export function HomeScreen () {
  const {signOut} = React.useContext(AuthContext);
  return (
    <SafeAreaView style={[styles.container, {} ]}>
      <Text>HOME SCREEN</Text>
      <Button
        title="Sign Out"
        onPress={() => signOut()}
      />
    </SafeAreaView>
  );
}