import { styles } from '../styles'
import { SafeAreaView } from 'react-native'
import { Text, } from '@rneui/themed'
import * as React from 'react'

export const ErrorMessage = (props) => {
  return (
    <SafeAreaView style={[styles.container, {}]}>
      <Text style={[styles.error, {}]}>{"Well, this is embarrasing to admit, but an error occurred!\n\n" + props.error.message}</Text>
    </SafeAreaView>
  )
} 