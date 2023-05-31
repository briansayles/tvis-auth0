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

export const colors = {
  background: 'lightgrey',
}

export const styles = StyleSheet.create({
  test: {
    // borderColor: 'blue',
    // borderStyle: 'dotted',
    // borderWidth: 1,
  },
  column1: {
    // backgroundColor: 'orange'
  },
  column2: {
    // backgroundColor: 'transparent'
  },
  column3: {
    // backgroundColor: 'pink'
  },
  inputTitleEnabled: {
    fontWeight: 'bold',
    color: 'black',
  },
  inputTitleDisabled: {
    fontWeight: 'normal',
    color: 'grey',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
    paddingHorizontal: responsiveWidth(1),
    paddingVertical: responsiveHeight(1),
  },
  swipeListViewContentContainer: {
    
  },
  // title: {
  //   fontSize: 20,
  //   textAlign: 'center',
  //   marginTop: 40,
  // },
  sectionTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    alignItems: 'center',
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    paddingTop: responsiveFontSize(1),
    paddingBottom: responsiveFontSize(0.5),
    paddingHorizontal: responsiveFontSize(0.5),
  },
  sectionTitleText: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    paddingLeft: responsiveFontSize(0.5),
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
    alignItems: 'center',
    // backgroundColor: '#CCC',
    // justifyContent: 'center',
    height: responsiveFontSize(4.5),

    // flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomColor: 'black',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveFontSize(1),
    width: responsiveWidth(90),
    // backgroundColor: 'pink'
  },
  rowFrontColorup: {
    height: responsiveFontSize(1.75),
  },
  rowBack:{
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'cyan',
    height: 25,
    width: 150,
  },
  rowBackOld: {
    alignItems: 'center',
    height: responsiveFontSize(4.5),
    // backgroundColor: '#8BC645',
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // padding: 15,
    // flex: 1,
    // flexDirection: 'row',
    // alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomColor: 'black',
    // justifyContent: 'space-between',
    marginHorizontal: -responsiveFontSize(2),
    width: responsiveWidth(90),
    // backgroundColor: 'red',
  },
  backRightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'yellow',
    right: 0,
  },
//   backRightBtnLeft: {
//       backgroundColor: 'blue',
//       right: responsiveFontSize(8),
//   },
//   backRightBtnCenter: {
//     backgroundColor: 'blue',
//     right: responsiveFontSize(4),
// },
//   backRightBtnRight: {
//     backgroundColor: 'red',
//     right: 0,
//   },
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
  bold: {
    fontWeight: 'bold',
  },
  red: {
    color: 'red',
  },
  green: {
    color: 'green'
  },
  bannerAdContainer: {
    backgroundColor: colors.background, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    bottom: 0, 
    height: 50
  },
  blindsTitleText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(6), responsiveWidth(6)),
  },
  blindsText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(11.5), responsiveWidth(11.5)),
    fontWeight: 'bold',
  },
  blindsTitleTextLandscape: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)),
    flex: 2.5,
  },
  blindsTextLandscape: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)),
    fontWeight: 'bold',
    flexWrap: 'wrap',
    // flexGrow: 6,
    flex: 3,
  },
  durationTextLandscape: {
    color: 'rgba(225, 225, 225, 1)',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)) ,
    flex: 2,
  },
  durationText: {
    color: 'rgba(225, 225, 225, 1)',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)) 
  },
  anteText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)),
  },
  blindsNoticeText: {
    fontWeight: '300',
  },
  nextBlindsText: {
    color: 'black',
    fontSize: Math.min(responsiveHeight(7), responsiveWidth(7)),
    fontWeight: '500',
    textAlign: 'center',
  },
  nextBlindsTextLandscape: {
    color: 'black',
    fontSize: Math.min(responsiveHeight(7), responsiveWidth(7)),
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  nextBlindsNoticeText: {
    color: 'red',
  },
  timerText: {
    color: 'rgba(225,225,225,1)',
    fontFamily: 'Menlo',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)),
  },
  timerNoticeText: {
    color: 'red',
  },
  titleText: {
    fontSize: Math.min(responsiveHeight(4.5), responsiveWidth(4.5)),
    color: '#222',
    fontWeight: 'bold'
  },
  chipText: {
    fontSize: responsiveFontSize(2.5),
    color: 'rgba(225,225,225,1)',
  }
});