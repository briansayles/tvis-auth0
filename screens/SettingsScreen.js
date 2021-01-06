import * as React from 'react';
import { SafeAreaView, View, Text, Button, Platform, Alert, FlatList } from 'react-native';
import { gql} from '@apollo/client'
import { styles } from '../styles'


export function SettingsScreen() {
  return (
    <SafeAreaView style={[styles.container, {} ]}>
      <Text>Settings SCREEN</Text>
    </SafeAreaView>
  );
}