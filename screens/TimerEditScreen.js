import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, View, } from 'react-native'
import { Text, Button, CheckBox} from '@rneui/themed'
import { FormView, Picker, SubmitButton, MyInput, DeleteButton, } from '../components/FormComponents'
import { dictionaryLookup, } from '../utilities/functions'
import { ErrorMessage } from '../components/ErrorMessage'

export const TimerEditScreen = (props) => {
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_TIMER_QUERY, {variables: {id: props.route.params.id}})
  const [updateTimer] = useMutation(UPDATE_TIMER_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  useEffect(()=>{
    if (data) {
      setInitialValues(data.timers_by_pk)
      setFormValues(data.timers_by_pk)
    }
  },[data])
  
  const handleInputChange = (fieldName, value) => {
    setFormValues({...formValues, [fieldName]:value})
  }

  const isDirty = () => {
    let result = false
    Object.keys(formValues).forEach((key, index) => { if (formValues[key] !== initialValues[key]) result = true })
    return result
  }

  if (loading) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (data && formValues !== null && initialValues !== null) {
    return (
      <FormView>
        <View style={{flex: 8, flexDirection: 'column', justifyContent: 'flex-start'}}>
          <CheckBox
            title="Play sound and speech one minute before the end of each round"
            checked={formValues.playOneMinuteRemainingSound}
            onPress={()=> {handleInputChange('playOneMinuteRemainingSound', !formValues.playOneMinuteRemainingSound)}}
            containerStyle={{backgroundColor: 'transparent'}}
          />
          <MyInput
            title="One minute remaining speech (optional)"
            value={(formValues?.oneMinuteRemainingSpeech ? formValues.oneMinuteRemainingSpeech : "")}
            placeholder="Enter one minute remaining speech here..."
            onChangeText={(text) => handleInputChange('oneMinuteRemainingSpeech', text)}
            keyboardType="default"
            multiline={true}
            disabled={!formValues?.playOneMinuteRemainingSound}
          />
          <CheckBox
            title="Play sound and speech at the end of each round"
            checked={formValues.playEndOfRoundSound}
            onPress={()=> {handleInputChange('playEndOfRoundSound', !formValues.playEndOfRoundSound)}}
            containerStyle={{backgroundColor: 'transparent'}}
          />
          <MyInput
            title="End of round speech (optional)"
            value={(formValues?.endOfRoundSpeech ? formValues.endOfRoundSpeech : "")}
            placeholder="Enter end of round speech here. It will be followed automatically by 'The blinds are now ___ and ___ ...'"
            onChangeText={(text) => handleInputChange('endOfRoundSpeech', text)}
            keyboardType="default"
            multiline={true}
            disabled={!formValues?.playEndOfRoundSound}
          />
          {/* <MyInput
            title="End of round speech (automatic) that will be appended to above speech"
            value="The blinds are now ___ and ___ [with an ante of ___]"
            // placeholder="Enter end of round speech here..."
            // onChangeText={(text) => handleInputChange('endOfRoundSpeech', text)}
            // keyboardType="default"
            multiline={true}
            disabled={!formValues?.playEndOfRoundSound}
            editable={false}
          /> */}        
        </View>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
          {/* <DeleteButton
            mutation={deleteCost}
            navigation={()=> props.navigation.goBack()}
            confirmationString={'Are you sure you want to delete this entry fee?'}
            confirmationTitleString='Confirm Deletion'
          /> */}
          <SubmitButton 
            mutation={updateTimer}
            // disabled={!isDirty()}
            navigation={()=> props.navigation.goBack()}
          />
        </View>
      </FormView>
    )
  }
}

const UPDATE_TIMER_MUTATION = gql`
  mutation updateTimer(
    $id: uuid!, 
    $playOneMinuteRemainingSound: Boolean, 
    $oneMinuteRemainingSpeech: String, 
    $playEndOfRoundSound: Boolean, 
    $endOfRoundSpeech: String, 
    $backgroundColor: String
    ) 
    {update_timers_by_pk(pk_columns: {id: $id}, _set: {
      playOneMinuteRemainingSound: $playOneMinuteRemainingSound, 
      oneMinuteRemainingSpeech: $oneMinuteRemainingSpeech, 
      playEndOfRoundSound: $playEndOfRoundSound,
      endOfRoundSpeech: $endOfRoundSpeech,
      backgroundColor: $backgroundColor
      }) 
    {
      playOneMinuteRemainingSound
      oneMinuteRemainingSpeech
      playEndOfRoundSound
      endOfRoundSpeech
      backgroundColor
      id
    }
  }
`

const GET_TIMER_QUERY = gql`
  query Timer($id: uuid!) {
    timers_by_pk(id: $id) {
      playOneMinuteRemainingSound
      oneMinuteRemainingSpeech
      playEndOfRoundSound
      endOfRoundSpeech
      backgroundColor
      id
    }
  }
`