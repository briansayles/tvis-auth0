import { SafeAreaView, View, ActivityIndicator } from 'react-native'
import { Text, Button, Image, } from 'react-native-elements'
import * as React from 'react'
import { AuthContext } from '../Contexts'
import { styles, responsiveHeight, responsiveWidth } from '../styles'
import { BannerAd } from '../components/Ads'
import { AppLayout } from '../components/AppLayout'

export function HomeScreen (props) {
  const {signOut} = React.useContext(AuthContext);
  return (
    <AppLayout>
      <View style={{alignItems: 'center'}}>
        <Image style={{width: responsiveWidth(50), height: responsiveWidth(50)}} source={require('../assets/icons/app-icon.png')} PlaceholderContent={<ActivityIndicator/>}/>
        <Text h3 style={{width: responsiveWidth(75), textAlign: 'center', paddingTop: responsiveHeight(2)}}>
          Live Poker Tournament design and management made EASY!!
        </Text>
      </View>
      <Button
        top={responsiveHeight(40)}
        title="Sign Out"
        onPress={() => signOut()}
      />    
    </AppLayout>
  );
}