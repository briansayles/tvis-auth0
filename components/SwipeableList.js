import { styles, responsiveFontSize, responsiveWidth } from '../styles'
import { TouchableHighlight, View, TouchableOpacity, Icon, ActivityIndicator, Pressable} from 'react-native'
import { Text, Button, } from 'react-native-elements'
import { SwipeListView } from 'react-native-swipe-list-view'
import * as React from 'react'
import { Ionicons } from '@expo/vector-icons'

export const SwipeableList = (props) =>{
    [refreshingState, setRefreshingState] = React.useState(false)
    return (
      <SwipeListView
      style={[styles.swipeListView, {...props.style}]}
      contentContainerStyle={[styles.swipeListViewContentContainer, {...props.contentContainerStyle}]}
      refreshing={refreshingState}
      onRefresh={()=>{
        if (props.refetch) {
          setRefreshingState(true)
          props.refetch().then(()=> 
            setRefreshingState(false)
          )
        }
      }}
      data={props.data}
      keyExtractor={props.keyExtractor}
      ListHeaderComponent={ <ListHeader title={props.headerTitle} create={props.create}/> }
      rightOpenValue={-responsiveFontSize(4)*((props.rightButton1 ? 1 : 0) + (props.rightButton2 ? 1 : 0) + (props.rightButton3 ? 1 : 0))}
      stickyHeaderIndices={[0]}
      disableRightSwipe = {true}
      swipeToOpenPercent = {10}
      swipeToClosePercent = {10}
      closeOnRowBeginSwipe = {true}
      closeOnRowOpen = {true}
      closeOnRowPress = {true}
      closeOnScroll = {true}

      renderItem= {props.renderItem}
      renderHiddenItem={ (data, rowMap) => (
        <View style={[styles.rowBack, {}]}>
          {props.rightButton3 && 
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnLeft, {backgroundColor: props.rightButton3.backgroundColor}, {}]}
              onPress={() => {props.rightButton3.onPress(data.item)}}
            >
              <Ionicons name={props.rightButton3.ioniconName} color="white"/>
            </TouchableOpacity>
          }
          {props.rightButton2 && 
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnCenter, {backgroundColor: props.rightButton2.backgroundColor}, {}]}
              onPress={() => {props.rightButton2.onPress(data.item)}}
            >
              <Ionicons name={props.rightButton2.ioniconName} color="white"/>
            </TouchableOpacity>
          }
          {props.rightButton1 && 
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight, {backgroundColor: props.rightButton1.backgroundColor}, {}]}
              onPress={() => {props.rightButton1.onPress(data.item)}}
            >
              <Ionicons name={props.rightButton1.ioniconName} color="white"/>
            </TouchableOpacity>
          }
        </View>
      )}
    />
  )
}

export const ListHeader = (props) => {
  const handleSearchBoxChanged = (text) => {
    props.onSearch(text)
  }

  return (
    <View style={{
      paddingTop: responsiveFontSize(1), 
      paddingBottom: responsiveFontSize(1),
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: 'white',
      borderBottomColor: '#888',
      borderBottomStyle: 'solid',
      borderBottomWidth: 2,
    }}>
      <Text style={{fontSize: responsiveFontSize(2)}}>
        {props.title}
      </Text>
      {props.create && !props.loading &&
        <TouchableHighlight
          style={{}}
          onPress={() => props.create()} 
        >
          <Ionicons name='ios-add' size={responsiveFontSize(3)} color="green"/>
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
  )
}