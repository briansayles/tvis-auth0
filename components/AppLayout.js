import * as React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView, View, } from 'react-native';
import { Text, Button, Image } from 'react-native-elements'
import { AuthContext } from '../App'
import { BannerAd } from '../components/Ads'

import { styles, responsiveHeight, responsiveWidth } from '../styles'


export function AppLayout(props) {
  return (
    <SafeAreaView style={[styles.container, {} ]}>
      <View style={[styles.appContainer, {}]}>
        {props.children}
      </View>
      <View style={[styles.adContainer, {}]}>
        <BannerAd/>      
      </View>
    </SafeAreaView>
  );
}