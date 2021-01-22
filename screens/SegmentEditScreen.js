import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, } from 'react-native'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup, } from '../utilities/functions'
import { ErrorMessage } from '../components/ErrorMessage'

export const SegmentEditScreen = (props) => {
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_SEGMENT_QUERY, {variables: {id: props.route.params.id}})
  
  useEffect(()=>{
    if (data) {
      setInitialValues(data.segments_by_pk)
      setFormValues(data.segments_by_pk)
    }
  },[data])
  
  const [updateSegment] = useMutation(UPDATE_SEGMENT_MUTATION, {
    variables: {
      ...formValues,
    },
  })

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
        <MyInput
          title="Small Blind"
          value={(formValues?.sBlind || 0).toString()}
          placeholder="Enter small blind here..."
          onChangeText={(text) => handleInputChange('sBlind', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
        />
        <MyInput
          title="Big Blind"
          value={(formValues?.bBlind || 0).toString()}
          placeholder="Enter big blind here..."
          onChangeText={(text) => handleInputChange('bBlind', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
          onFocus={(currentText = '') => {
            setFormValues({...formValues, bBlind: formValues.bBlind || parseInt(formValues.sBlind) * 2})
          }}
        />
        <MyInput
          title="Ante"
          value={(formValues?.ante || 0).toString()}
          placeholder="Enter ante here..."
          onChangeText={(text) => handleInputChange('ante', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
        />
        <Picker
          prompt="Choose your duration"
          title="Duration (in minutes)"
          initialValue={initialValues?.duration || "Pick duration..."}
          selectedValue={formValues?.duration}
          onValueChange={(itemValue, itemIndex) => handleInputChange('duration', parseInt(!itemValue ? 0 : itemValue))}
        >
          {dictionaryLookup("DurationOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={parseInt(item.shortName)}/>
          ))
          }
        </Picker>
        <SubmitButton 
          mutation={updateSegment}
          disabled={!isDirty()}
        />
      </FormView>
    )
  }
  return null
}

const UPDATE_SEGMENT_MUTATION = gql`
  mutation updateSegment($bBlind: Int = 0, $ante: Int = 0, $duration: Int = 0, $sBlind: Int = 0, $id: Int!) {
    update_segments_by_pk(pk_columns: {id: $id}, _set: {sBlind: $sBlind, bBlind: $bBlind, ante: $ante, duration: $duration}) {
      id
      sBlind
      bBlind
      ante
      duration
    }
  }
`

const GET_SEGMENT_QUERY = gql`
  query getSegment($id: Int!) {
    segments_by_pk(id: $id) {
      id
      sBlind
      bBlind
      ante
      duration
    }
  }
`