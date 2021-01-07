import { StyleSheet, Dimensions } from 'react-native'

export const responsiveFontSize = (f) => {
  const {height, width} = Dimensions.get('window');
  return Math.sqrt((height*height)+(width*width))*(f/100);
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 2,
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
    backgroundColor: 'white',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 5,
  },
  rowBack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    right: 0,
  },
  backRightBtnLeft: {
      backgroundColor: 'blue',
      right: 150,
  },
  backRightBtnCenter: {
    backgroundColor: 'blue',
    right: 75,
},
  backRightBtnRight: {
      backgroundColor: 'red',
      right: 0,
  },  


});