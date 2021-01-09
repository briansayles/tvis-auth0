import { responsiveFontSize, responsiveWidth, responsiveHeight } from '../styles'
import { TouchableHighlight, View, TouchableOpacity, Icon, ActivityIndicator, Pressable, StyleSheet} from 'react-native'
import { Text, Button, } from 'react-native-elements'
import { SwipeListView } from 'react-native-swipe-list-view'
import * as React from 'react'
import { Ionicons } from '@expo/vector-icons'

export function SwipeableList (props) {
    const [refreshingState, setRefreshingState] = React.useState(false)
    const [collapsedState, setCollapsedState] = React.useState(false)

    const swipeableStyles = StyleSheet.create(
      {
        swipeListView: {
          flex: 1,
          backgroundColor: 'whitesmoke',
          paddingHorizontal: responsiveWidth(1),
        },
        swipeListViewContentContainer: {

        },
        rowFront: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'whitesmoke',
          borderBottomColor: 'black',
          justifyContent: 'space-between',
          width: responsiveWidth(95),
          height: collapsedState ? 0 : responsiveFontSize(4),
          paddingHorizontal: responsiveFontSize(1),
        },
        rowBack: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'whitesmoke',
          borderBottomColor: 'black',
          justifyContent: 'space-between',
          width: responsiveWidth(95),
          height: collapsedState ? 0 : responsiveFontSize(4),
          paddingLeft: responsiveFontSize(1),
        },
        backRightBtn: {
          alignItems: 'center',
          bottom: 0,
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          width: responsiveFontSize(4),
          right: 0,
          height: collapsedState ? 0 : responsiveFontSize(4),
        },
        backRightBtnLeft: {
            backgroundColor: 'blue',
            right: responsiveFontSize(8),
        },
        backRightBtnCenter: {
          backgroundColor: 'blue',
          right: responsiveFontSize(4),
      },
        backRightBtnRight: {
            backgroundColor: 'red',
            right: 0,
        },
      }
    )
    return (
      <SwipeListView
        style={[swipeableStyles.swipeListView, {...props.style}]}
        contentContainerStyle={[swipeableStyles.swipeListViewContentContainer, {...props.contentContainerStyle}]}
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
        ListHeaderComponent={ 
          <ListHeader 
            title={props.headerTitle + ' (' + props.data.length + ')'} 
            create={props.create} 
            showCollapseIcon={props.collapsible} 
            isCollapsed={collapsedState} 
            onToggleCollapse={() => setCollapsedState(!collapsedState)}
          /> 
        }
        rightOpenValue={-responsiveFontSize(4)*((props.rightButton1 ? 1 : 0) + (props.rightButton2 ? 1 : 0) + (props.rightButton3 ? 1 : 0))}
        stickyHeaderIndices={[0]}
        disableRightSwipe = {true}
        swipeToOpenPercent = {10}
        swipeToClosePercent = {10}
        closeOnRowBeginSwipe = {true}
        closeOnRowOpen = {true}
        closeOnRowPress = {true}
        closeOnScroll = {true}

        renderItem = {props.renderItem}
        
        renderHiddenItem={ (data, rowMap) => {
 
            return(
              <View style={[swipeableStyles.rowBack, {}]}>
                {props.rightButton3 && 
                  <TouchableOpacity
                    style={[swipeableStyles.backRightBtn, swipeableStyles.backRightBtnLeft, {backgroundColor: props.rightButton3.backgroundColor}, {}]}
                    onPress={() => {props.rightButton3.onPress(data.item)}}
                  >
                    <Ionicons name={props.rightButton3.ioniconName} color="white"/>
                  </TouchableOpacity>
                }
                {props.rightButton2 && 
                  <TouchableOpacity
                    style={[swipeableStyles.backRightBtn, swipeableStyles.backRightBtnCenter, {backgroundColor: props.rightButton2.backgroundColor}, {}]}
                    onPress={() => {props.rightButton2.onPress(data.item)}}
                  >
                    <Ionicons name={props.rightButton2.ioniconName} color="white"/>
                  </TouchableOpacity>
                }
                {props.rightButton1 && 
                  <TouchableOpacity
                    style={[swipeableStyles.backRightBtn, swipeableStyles.backRightBtnRight, {backgroundColor: props.rightButton1.backgroundColor}, {}]}
                    onPress={() => {props.rightButton1.onPress(data.item)}}
                  >
                    <Ionicons name={props.rightButton1.ioniconName} color="white"/>
                  </TouchableOpacity>
                }
              </View>
            )

        }
      }
    />
  )
}


export const ListHeader = (props) => {
  const handleSearchBoxChanged = (text) => {
    props.onSearch(text)
  }

  return (
    <View style={{
      padding: responsiveFontSize(0.25),
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: 'white',
      borderBottomColor: '#888',
      borderBottomStyle: 'solid',
      borderBottomWidth: 2,
    }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
      {props.showCollapseIcon &&
        <Ionicons name={props.isCollapsed ? 'chevron-forward' : 'chevron-down'} size={responsiveFontSize(3)} color="black" onPress={props.onToggleCollapse}/>
      }
    </View>
  )
}