import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, } from 'react-native'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup, } from '../utilities/functions'
import { ErrorMessage } from '../components/ErrorMessage'


export const ChipEditScreen = (props) => {
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_CHIP_QUERY, {variables: {id: props.route.params.id}})
  
  useEffect(()=>{
    if (data) {
      setInitialValues(data.chips_by_pk)
      setFormValues(data.chips_by_pk)
    }
  },[data])
  
  const [updateChip] = useMutation(UPDATE_CHIP_MUTATION, {
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
          title="Denomination"
          value={(formValues.denom || 0).toString()}
          placeholder="Enter denomination here..."
          onChangeText={(text) => handleInputChange('denom', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
        />
        <MyInput
          title="Quantity Availalbe"
          value={(formValues.qty_available || 0).toString()}
          placeholder="Enter number of these chips on hand..."
          onChangeText={(text) => handleInputChange('qty_available', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
        />
        <Picker
          prompt="Choose a color"
          title="Chip color"
          initialValue={initialValues.color || "Pick color..."}
          selectedValue={formValues.color || '#fff'}
          onValueChange={(itemValue, itemIndex) => handleInputChange('color', itemValue)}
        >
          {dictionaryLookup("ChipColorOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={item.shortName}/>
          ))
          }
        </Picker>
        <SubmitButton 
          mutation={updateChip}
          disabled={!isDirty()}
        />
      </FormView>
    )
  }
  return null
}

const UPDATE_CHIP_MUTATION = gql`
  mutation updateChip($color: String = "#fff", $denom: Int = 1, $qty_available: Int = 0, $id: Int!) {
    update_chips_by_pk(pk_columns: {id: $id}, _set: {color: $color, denom: $denom, qty_available: $qty_available}) {
      color
      denom
      id
      qty_available
    }
  }
`

const GET_CHIP_QUERY = gql`
  query getChip($id: Int!) {
    chips_by_pk(id: $id) {
      color
      denom
      id
      qty_available
    }
  }
`