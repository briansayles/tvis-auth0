import * as React from 'react';
import { SafeAreaView, View, Text, Button, Platform, Alert, FlatList } from 'react-native';
import { AuthContext } from '../App'

import { styles } from '../styles'


export function SignInScreen() {
  const {signIn} = React.useContext(AuthContext);

  return (
    <SafeAreaView style={[styles.container, {} ]}>
      <Button
        title="Sign In or Sign Up (FREE)"
        onPress={() => signIn()}
      />
    </SafeAreaView>
  );
}