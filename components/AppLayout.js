import * as React from 'react';
import { SafeAreaView, View, } from 'react-native';

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