import { styles } from '../styles'
import { Text, SafeAreaView } from 'react-native'
import * as React from 'react'

export const ErrorMessage = (props) => {
  return (
    <SafeAreaView style={[styles.container, {}]}>
      <Text style={[styles.error, {}]}>{"Well, this is embarrasing to admit, but an error occurred!\n\n" + props.error.message}</Text>
    </SafeAreaView>
  )
} 