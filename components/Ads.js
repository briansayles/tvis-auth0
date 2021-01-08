import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import { AdMobConfig } from '../config'
import * as React from 'react'
import { View } from 'react-native'
import { responsiveHeight, responsiveWidth } from '../styles';

export const BannerAd = (props) => {
  const getTestDeviceId = async () => {
   const testDeviceID = await setTestDeviceIDAsync('EMULATOR');
  }
  const bannerError = (error) => {
    console.log(AdMobConfig.BannerAd)
    console.log(error.toString())
  }
  getTestDeviceId()
  return (
    <View style={{backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', bottom: 0, height: 50}}>
      <AdMobBanner
        adUnitID={AdMobConfig.BANNER_ID}
        bannerSize="smartBannerPortrait"
        servePersonalizedAds
        onDidFailToReceiveAdWithError={bannerError}
      />
    </View>
  )
}