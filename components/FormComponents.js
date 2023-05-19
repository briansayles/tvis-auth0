import React, { Component, useState } from 'react'
import ReactNative, {
  Platform, View, TouchableOpacity, TouchableHighlight, StyleSheet, ActionSheetIOS, ActivityIndicator, Alert
} from 'react-native'
import { Button, Icon, Input, Text, } from '@rneui/themed'
import { KeyboardAwareScrollView, } from 'react-native-keyboard-aware-scroll-view'
import {Ionicons, } from '@expo/vector-icons'
import {Picker as RNPPicker} from '@react-native-picker/picker'
import { responsiveFontSize } from '../utilities/functions'

export const theme= {
  Button: {
    titleStyle: {
      color: '#ccc',
    },
    icon: {
      color: 'blue',
      
    }
  },
  Text: {
    style: {
      color: '#777'
    }
  },
  Card: {
    containerStyle: {
      backgroundColor: '#eee',
      borderRadius: 10,
      padding: 10,
      margin: 10,
    },
  },
  ListItem: {
    wrapperStyle: {
      backgroundColor: 'blue',
    },
    topDivider: true,
    bottomDivider: true,
    chevron: true,
  },
}

export const ListHeader = (props) => {
  const handleAddButtonPressed = () => {
    props.onAddButtonPress()
  }

  const handleSearchBoxChanged = (text) => {
    props.onSearch(text)
  }

  return (
    <View style={{
      flex: responsiveFontSize(.01),
      paddingTop: responsiveFontSize(1), 
      paddingLeft: responsiveFontSize(2),
      paddingBottom: responsiveFontSize(1),
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: 'white',
      borderBottomColor: '#888',
      borderBottomStyle: 'solid',
      borderBottomWidth: responsiveFontSize(.05),
    }}>
      <Text style={{fontSize: responsiveFontSize(2)}}>
        {props.title}
      </Text>
      {props.showAddButton && !props.loading &&
        <TouchableHighlight
          style={{marginRight: responsiveFontSize(3)}}
          onPress={()=> handleAddButtonPressed()} 
        >
          <Ionicons name='ios-add' size={responsiveFontSize(4)} color="green"/>
        </TouchableHighlight>
      }
      {props.showAddButton && props.loading &&
        <View style={{marginRight: responsiveFontSize(3)}}>
          <ActivityIndicator
            color="rgba(100, 100, 100, 1)"
            size="small"        
          />
        </View>
      }
    </View>
  )
 }

export const FormView = (props) => {
  return(
    <KeyboardAwareScrollView
      contentContainerStyle={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', padding: responsiveFontSize(4), marginTop: responsiveFontSize(4)}}
      {...props}
    >
      {props.children}
    </KeyboardAwareScrollView>
  )
}

export const MyInput = (props) => {
  return (
    <Input
      value={props.value.toString()}
      label={props.title}
      inputContainerStyle={{marginBottom: responsiveFontSize(4), }}
      {...props}
    />
  )  
}

export const DeleteButton = (props) => {
  [busy, setBusy] = useState(false)
  const handlePress = () => {
  	setBusy(true)
    if (props.confirmationString && props.confirmationTitleString) {
      Alert.alert(props.confirmationTitleString, props.confirmationString, 
        [
          {text: 'Cancel', onPress: ()=>{}, style: 'cancel'}, 
          {text: 'OK', onPress: ()=>{
            props.mutation().then(()=> {
              setBusy(false)
              if (props.navigation) {props.navigation()}  
            })
          }, 
          style: 'default'}])
    }
  }
  return (
    <Button 
      icon={busy ? <ActivityIndicator/> : <Icon
        name='trash'
        color='#fff'
        type='ionicon'
      />}
      iconRight
      buttonStyle={{ 
        borderRadius: responsiveFontSize(1), 
        marginTop: responsiveFontSize(1.5), 
        paddingLeft: responsiveFontSize(1), 
        paddingRight: responsiveFontSize(1), 
        // marginLeft: 0, 
        // marginRight: 0, 
        // marginBottom: 0, 
        backgroundColor: '#d00', 
        alignSelf: 'flex-end'
      }}
      title='Delete  '
      titleStyle={{fontSize: 14, color: '#fff'}}
      onPress={() => handlePress()}
      {...props}
    />
  )
}

export const SubmitButton = (props) => {
  [busy, setBusy] = useState(false)
  const handlePress = () => {
  	setBusy(true)
  	props.mutation().then(() => {
  		setBusy(false)
      if (props.navigation) {props.navigation()}  
  	})
  }  
  return (
    <Button 
      icon={busy ? <ActivityIndicator/> : <Icon
        name='ios-checkmark-circle-outline'
        color='#fff'
        type='ionicon'
      />}
      iconRight
      buttonStyle={{ 
        borderRadius: responsiveFontSize(1), 
        marginTop: responsiveFontSize(1.5), 
        paddingLeft: responsiveFontSize(1), 
        paddingRight: responsiveFontSize(1), 
        // marginLeft: 0, 
        // marginRight: 0, 
        // marginBottom: 0, 
        backgroundColor: '#050', 
        alignSelf: 'flex-end'
      }}
      disabledStyle={{backgroundColor: "#0504"}}
      title='Submit  '
      titleStyle={{fontSize: 14, color: '#fff'}}
      onPress={() => handlePress()}
      {...props}
    />
  )
}

export const GoToTimerButton = (props) => {
  // [busy, setBusy] = useState(false)
  const handlePress = () => {
  	// setBusy(true)
  	// props.mutation().then(() => {
  		// setBusy(false)
      if (props.navigation) {props.navigation()}  
  	// })
  }  
  return (
    <Button 
      icon={<Icon
        name='ios-checkmark-circle-outline'
        color='#fff'
        type='ionicon'
      />}
      iconRight
      buttonStyle={{ 
        borderRadius: responsiveFontSize(1), 
        marginTop: responsiveFontSize(1.5), 
        paddingLeft: responsiveFontSize(1), 
        paddingRight: responsiveFontSize(1), 
        // marginLeft: 0, 
        // marginRight: 0, 
        // marginBottom: 0, 
        backgroundColor: '#050', 
        alignSelf: 'flex-end'
      }}
      // disabledStyle={{backgroundColor: "#0504"}}
      title='Go to Timer  '
      titleStyle={{fontSize: 14, color: '#fff'}}
      onPress={() => handlePress()}
      {...props}
    />
  )
}

export class Picker extends Component {
  static Item = RNPPicker.Item

  constructor(props, context) {
    super(props, context)
    // this.onPress = () => this.handlePress()
  }

  handlePress() {
    const { children, onValueChange, prompt } = this.props
    const labels = children.map(child => child.props.label)
    const values = children.map(child => child.props.value)
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: prompt,
        options: [...labels, "Cancel"],
        cancelButtonIndex: labels.length,
      },
      index => {
        if (index < labels.length) {
          onValueChange(values[index])
        }
      }
    )
  }

  render() {
    const { children, style, textStyle, initialValue, title } = this.props
    const labels = children.map(child => child.props.label)
    const values = children.map(child => child.props.value)
    const flatStyle = (style ? StyleSheet.flatten(style) : {})

    if (Platform.OS === 'ios') {
      const { selectedValue } = this.props

      const defaultTextStyle = {
        fontSize: 18,
        lineHeight: (flatStyle.height ? flatStyle.height : 18),
      }

      return (
      	<View style={{flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, marginTop: 12}}>
	        <TouchableOpacity
	          onPress={() => this.handlePress()}
	          style={[{
	            alignSelf: 'stretch',
	            alignItems: 'center',
	            justifyContent: 'center',
	            flexDirection: 'row',
	            paddingHorizontal: 10,
	          }, flatStyle]}
	        >
	          <Text style={[{ flex: 1 }, defaultTextStyle, textStyle]}>
	            {labels[values.indexOf(selectedValue || initialValue)] || initialValue}
	          </Text>
	          <Text style={[{color: 'black'}, defaultTextStyle, textStyle]}>▼</Text>
	        </TouchableOpacity>
        </View>
      )
    } else {
      return (
        <View
          style={[{
            alignSelf: 'stretch',
            paddingHorizontal: 10,
          }, flatStyle]}
        >
          <RNPPicker
            {...this.props}
            style={textStyle}
          />
        </View>
      )
    }
  }
}