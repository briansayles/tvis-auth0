import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, View, Alert, Text } from 'react-native'
import { FormView, Picker, SubmitButton, MyInput, DeleteButton, } from '../components/FormComponents'
import { dictionaryLookup, } from '../utilities/functions'
import { ErrorMessage } from '../components/ErrorMessage'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useFocusEffect } from '@react-navigation/core'
import useDimensions from '@rnhooks/dimensions'

export const ChipEditScreen = (props) => {
  const { fontScale, width, height, scale } = useDimensions('screen')
  const orientation = height > width ? 'portrait' : 'landscape'
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_CHIP_QUERY, {variables: {id: props.route.params.id}})
  const [ deleteChip, {loading: deletingChip, data: deleteChipData, error: deleteChipError} ] = useMutation(DELETE_CHIP_MUTATION, {
    variables: {
      id: props.route.params.id
    }
  })
  const [updateChip] = useMutation(UPDATE_CHIP_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  useEffect(()=>{
    if (data) {
      setInitialValues(data.chips_by_pk)
      setFormValues(data.chips_by_pk)
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
          <MyInput
            title="Denomination"
            value={(formValues.denom).toString().replace(/^0+/, '')}
            placeholder="Enter denomination here..."
            onChangeText={(text) => handleInputChange('denom', (!text ? 0 : text))}
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
        </View>
        <View style={{flex: orientation == 'portrait' ? 1 : 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <DeleteButton
            mutation={deleteChip}
            navigation={()=> props.navigation.goBack()}
            confirmationString={'Are you sure you want to delete this chip?'}
            confirmationTitleString='Confirm Deletion'
          />
          <SubmitButton 
            mutation={updateChip}
            // disabled={!isDirty()}
            navigation={()=> props.navigation.goBack()}
          />
        </View>
      </FormView>
    )
  }
  return null
}

const UPDATE_CHIP_MUTATION = gql`
  mutation UpdateChip($color: String = "#fff", $denom: numeric = 1, $qtyAvailable: Int = 0, $id: uuid!) {
    update_chips_by_pk(pk_columns: {id: $id}, _set: {color: $color, denom: $denom, qtyAvailable: $qtyAvailable}) {
      color
      denom
      id
      qtyAvailable
    }
  }
`
const DELETE_CHIP_MUTATION = gql`
  mutation DeleteChip($id: uuid!) {
    delete_chips_by_pk(id: $id) {
      id
    }
  }
`
const GET_CHIP_QUERY = gql`
  query Chip($id: uuid!) {
    chips_by_pk(id: $id) {
      color
      denom
      id
      qtyAvailable
    }
  }
`