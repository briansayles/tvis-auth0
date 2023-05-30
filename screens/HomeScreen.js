import { View, ActivityIndicator } from 'react-native'
import { Text, Button, Image, } from '@rneui/themed'
import * as React from 'react'
import { AuthContext } from '../Contexts'
import { styles, responsiveHeight, responsiveWidth } from '../styles'
import { AppLayout } from '../components/AppLayout'
import { useQuery, useMutation, gql } from '@apollo/client'

export function HomeScreen (props) {
  const {signOut, signIn, userName, userId} = React.useContext(AuthContext);
  const {loading, data, error} = useQuery(USER_QUERY)
  const [name, setName] = React.useState("")
  const [id, setId] = React.useState("")
  const [ insertUser, {loading: insertingUser, data: insertUserData, error: insertUserError} ] = useMutation(INSERT_USER_MUTATION, {
    variables: {
      name
    }
  })
  React.useEffect(()=> {
    // console.log('name effect') 
    const fetchName = async () => {
      setName(await userName())
    }
    fetchName()
  },[data])
  React.useEffect(()=>{
    // console.log('id effect')
    const fetchId = async () => {
      setId(await userId())
    }
    fetchId()
  },[data])
  React.useEffect(() => {
    if (data?.users?.length == 0 && name) {
      console.log('Creating new user in database')
      console.log(name)
      insertUser()
    }
  },[name, data])
  
  return (
    <AppLayout>
      <View style={[, {flex: 8, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center'}]}>
        <Image style={{width: responsiveWidth(50), height: responsiveWidth(50)}} source={require('../assets/icons/app-icon.png')} PlaceholderContent={<ActivityIndicator/>}/>
        <Text h3 style={{width: responsiveWidth(75), textAlign: 'center', paddingTop: responsiveHeight(2)}}>
          Live Poker Tournament design and management made EASY!!
        </Text>
      </View>
      {(data) && 
      <View style={[, {flex: 2, flexDirection: 'column', justifyContent: 'space-evenly'}]}>
      <Text>Logged in as: {name}</Text>
        <Button
          top={responsiveHeight(40)}
          onPress={() => signOut()}
        >
          Log Out
        </Button>
      </View>
      }
      {(!data) && 
      <View style={[, {flex: 2, flexDirection: 'column', justifyContent: 'space-evenly'}]}>
        <Text>  </Text>
        <Button
          top={responsiveHeight(40)}
          onPress={() => {signIn()}
          }
        >
          Log In or Sign Up (FREE)
        </Button>
      </View>
      }
    </AppLayout>
  );
}
const USER_QUERY = gql`
  query UserQuery {
    users {
      id
    }
  }
`
const INSERT_USER_MUTATION = gql`
  mutation insertNewUser($name: String) {
    insert_users_one(object: {name: $name}) {
      id
    }
  }
`