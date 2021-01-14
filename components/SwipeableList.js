import { responsiveFontSize, responsiveWidth, responsiveHeight, styles, colors } from '../styles'
import { TouchableHighlight, View, TouchableOpacity, Icon, ActivityIndicator, Pressable, StyleSheet, SectionList} from 'react-native'
import { Text, Button, } from 'react-native-elements'
import { SwipeRow} from 'react-native-swipe-list-view'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

export function SwipeableCollapsibleSectionList (props) {
  const [collapsedState, setCollapsedState] = useState([])
  useEffect(() => {
    setCollapsedState(Array(props.sections.length).fill(false));
    return () => {setCollapsedState(Array(props.sections.length).fill(false))}
  }, []);
  const functionWrapper = (wrappedFunction) => {
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
            {createFunction && <Ionicons onPress={()=>createFunction()} name='ios-add-circle' size={responsiveFontSize(2.5)} color="green"/>}
          </View>   
        </View>
      )}
      renderItem= {({item, index, section: {sectionIndex, onPressFunction, deleteFunction, renderFrontRow}}, rowMap)=> {
        // console.log(sectionIndex, index, collapsedState[sectionIndex])
        return(
            <SwipeRow
              closeOnRowPress={true}
              swipeToOpenPercent={10}
              rightOpenValue={-responsiveWidth(10)}
            >
              <View style={[styles.rowBack, {}]}>
                <View style={[styles.backRightBtn, styles.backRightBtnRight, collapsedState[sectionIndex] ? styles.collapsed : null, {}]}>
                  <Ionicons name='ios-trash' color="white" size={responsiveFontSize(2)} onPress={()=>functionWrapper(deleteFunction(item))}  />
                </View>
              </View>
              {renderFrontRow(item, index, collapsedState[sectionIndex])}              
            </SwipeRow>
        )
      }}
    />
  )
}