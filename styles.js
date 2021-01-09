import { StyleSheet, Dimensions, } from 'react-native'

export const responsiveFontSize = (f) => {
  const {height, width} = Dimensions.get('window');
  return Math.sqrt((height*height)+(width*width))*(f/100);
}

export const responsiveHeight = (h) => {
  const { height } = Dimensions.get('window')
  return height * h / 100
}

export const responsiveWidth = (w) => {
  const { width } = Dimensions.get('window')
  return width * w / 100
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: responsiveWidth(1),
    paddingVertical: responsiveHeight(1),
  },
  appContainer: {
    flex: 1,
    justifyContent:'space-around',
    alignItems: 'center',
  },
  adContainer: {
    height: 50,
    backgroundColor: 'white',
  },
  swipeListView: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    paddingHorizontal: responsiveWidth(1),
    paddingVertical: responsiveHeight(1),
  },
  swipeListViewContentContainer: {
    
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  active: {
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
  },
  listItemTitle: {
    fontSize: responsiveFontSize(1.75),
  },
  listItemSubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#888'
	},


  backTextWhite: {
      color: '#FFF',
  },
  rowFront: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'whitesmoke',
    borderBottomColor: 'black',
    justifyContent: 'space-between',
    width: responsiveWidth(95),
    height: responsiveFontSize(4),
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
    height: responsiveFontSize(4),
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
    height: responsiveFontSize(4),
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
  collapsed: {
    height: 0,
  },
  cardTitle: {
    fontSize: responsiveFontSize(2.25),
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center'
  },
  title: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
  },
  editButton: {
  },
  chipText: {
    fontSize: responsiveFontSize(3),
  },
  blindsHeader: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    flex: 2,
    textDecorationLine: 'underline',
  },
  blinds: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    flex: 2,
  },

});