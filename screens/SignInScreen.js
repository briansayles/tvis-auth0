import * as React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView, View, } from 'react-native';
import { Text, Button, Image } from 'react-native-elements'
import { AuthContext } from '../App'
import { BannerAd } from '../components/Ads'
import { AppLayout } from '../components/AppLayout'

import { styles, responsiveHeight, responsiveWidth } from '../styles'


export function SignInScreen(props) {
  const {signIn} = React.useContext(AuthContext);

  return (
    <AppLayout>
      <View style={{alignItems: 'center'}}>
        <Image style={{width: responsiveWidth(50), height: responsiveWidth(50)}} source={require('../assets/icons/app-icon.png')} PlaceholderContent={<ActivityIndicator/>}/>
        <Text h3 style={{width: responsiveWidth(75), textAlign: 'center', paddingTop: responsiveHeight(2)}}>
          Live Poker Tournament design and management made EASY
        </Text>
      </View>
      <Button
        top={responsiveHeight(40)}
        title="Sign In or Sign Up (FREE)"
        onPress={() => signIn()}
      />      
    </AppLayout>
  );
}