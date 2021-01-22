import { responsiveFontSize, responsiveWidth, responsiveHeight, styles, colors } from '../styles'
import { TouchableHighlight, View, TouchableOpacity, Icon, ActivityIndicator, Pressable, StyleSheet, SectionList} from 'react-native'
import { Text, Button, } from 'react-native-elements'
import { SwipeRow} from 'react-native-swipe-list-view'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

export function SwipeableCollapsibleSectionList (props) {
  const [collapsedState, setCollapsedState] = useState([])
  const buttonSize = 2.5
  const buttonSpacing = 1.5

  useEffect(() => {
    setCollapsedState(Array(props.sections.length).fill(false));
    return () => {setCollapsedState(Array(props.sections.length).fill(false))}
  }, []);
  const functionWrapper = (wrappedFunction, index) => {
    // ref.closeRow()
    wrappedFunction
  }
  return (
    <SectionList
      sections={props.sections}
      keyExtractor={(item, index) => {
        return (item.__typename + index.toString())        
      }}
      stickySectionHeadersEnabled={true}
      renderSectionHeader={({ section: { title, data, createFunction, sectionIndex, includeCountInTitle}}) => (
        <View style={[styles.sectionTitle, {}]}>
          <Pressable style={{flexDirection: 'row', alignItems: 'center', flex: 9, justifyContent: 'flex-start'}}
            onPress={()=>{
              setCollapsedState(
                collapsedState.map((mappedItem, mappedIndex)=>{
                  return (sectionIndex === mappedIndex ? !mappedItem : mappedItem)
                })
              )
            }}
          >
            <Ionicons name={collapsedState[sectionIndex] ? 'ios-chevron-forward-circle' : 'ios-chevron-down-circle'} size={responsiveFontSize(2.5)}/>
            <Text style={[styles.sectionTitleText, {}]}>{title} {includeCountInTitle ? '(' + data.length + ')':null}  </Text>
          </Pressable>
          <View style={{flex: 1}}>            
            {createFunction && <Ionicons onPress={()=>functionWrapper(createFunction())} name='ios-add-circle' size={responsiveFontSize(2.5)} color="green"/>}
          </View>   
        </View>
      )}
      renderItem= {({item, index, section: {sectionIndex, rightButtons, renderFrontRow}})=> {
        return(
          <SwipeRow
            closeOnRowPress={true}
            swipeToOpenPercent={10}
            rightOpenValue={-60}
            rightOpenValue={-responsiveFontSize(rightButtons.length * (buttonSize + 2 * buttonSpacing))}
          >
            <View style={[styles.rowBack, {}]}>
              {rightButtons.map((buttonData, buttonIndex) => { return (
                <View style={[
                  styles.backRightBtn, 
                  collapsedState[sectionIndex] ? styles.collapsed : null,
                  {backgroundColor: buttonData.backgroundColor, right: buttonIndex * responsiveFontSize(buttonSize + buttonSpacing)}]}
                  key={buttonIndex}
                >
                  <Ionicons 
                    name={buttonData.iconName} 
                    color='white' 
                    size={responsiveFontSize(3)} 
                    onPress={()=>functionWrapper(buttonData.onPress(item), index)}
                  />
                </View>
              )
              })}
            </View>
            {renderFrontRow(item, index, collapsedState[sectionIndex])}              
          </SwipeRow>
        )
      }}
    />
  )
}