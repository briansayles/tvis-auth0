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
                  <Ionicons name='ios-trash' color="white" size={responsiveFontSize(2)} onPress={()=>deleteFunction(item)}  />
                </View>
              </View>
              {renderFrontRow(item, index, collapsedState[sectionIndex])}              
            </SwipeRow>
        )
      }}
    />
  )
}
const holdingPen = () => {
  <>
  <View style={[styles.rowBack, {}]}>
  <View style={[styles.backRightBtn, styles.backRightBtnRight, {}]}>
    <Ionicons name='ios-trash' color="white" size={responsiveFontSize(2)}/>
  </View>
</View>
<View style={[styles.rowFront, {}]}>
    {renderFrontRow(item, index)}
    <Ionicons iconStyle={{flex: 1}} name='ios-arrow-forward' size={responsiveFontSize(2)} color="black"/>
</View>  
</>
}
export const ListHeader = (props) => {
  return (
    <View style={{
      padding: responsiveFontSize(0.25),
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: colors.background,
      borderBottomColor: '#888',
      borderBottomStyle: 'solid',
      borderBottomWidth: 2,
    }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {props.showCollapseIcon &&
          <Ionicons name={props.isCollapsed ? 'chevron-forward' : 'chevron-down'} size={responsiveFontSize(3)} color="black" onPress={props.onToggleCollapse}/>
        }
        <Text style={{fontSize: responsiveFontSize(2)}}>
          {props.title + '  '}
        </Text>
        {props.create && !props.loading &&
          <TouchableHighlight
            style={{}}
            onPress={() => props.create()} 
          >
            <Ionicons name='ios-add-circle' size={responsiveFontSize(3)} color="green"/>
          </TouchableHighlight>
        }
        {props.create && props.loading &&
          <View style={{marginRight: responsiveFontSize(3)}}>
            <ActivityIndicator
              color="rgba(100, 100, 100, 1)"
              size="small"        
            />
          </View>
        }
      </View>   
    </View>
  )
}