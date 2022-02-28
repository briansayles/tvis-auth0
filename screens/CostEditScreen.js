import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, } from 'react-native'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup, } from '../utilities/functions'
import { ErrorMessage } from '../components/ErrorMessage'

export const CostEditScreen = (props) => {
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_COST_QUERY, {variables: {id: props.route.params.id}})
  
  useEffect(()=>{
    if (data) {
      setInitialValues(data.Cost_by_pk)
      setFormValues(data.Cost_by_pk)
    }
  },[data])

  const [updateCost] = useMutation(UPDATE_COST_MUTATION, {
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
          title="Price"
          value={(formValues.price || 0).toString()}
          placeholder="Enter price here..."
          onChangeText={(text) => handleInputChange('price', !text ? 0 : text)}
          keyboardType="numeric"
        />
        <MyInput
          title="Chips"
          value={(formValues.chipStack || 0).toString()}
          placeholder="Enter chip value..."
          onChangeText={(text) => handleInputChange('chipStack', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
        />
        <Picker
          prompt="Choose entry fee type"
          title="Entry Fee Type"
          initialValue={initialValues.costType || "Pick entry fee type..."}
          selectedValue={formValues.costType}
          onValueChange={(itemValue, itemIndex) => handleInputChange('costType', itemValue)}
        >
          {dictionaryLookup("EntryFeeOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={item.shortName}/>
          ))
          }
        </Picker>
        <SubmitButton 
          mutation={updateCost}
          disabled={!isDirty()}
        />
      </FormView>        
    )
  }
  return null
}

const UPDATE_COST_MUTATION = gql`
  mutation updateCost($price: Float = 0, $chipStack: Int = 0, $costType: Cost_Type_enum = Buyin, $id: uuid!) {
    update_Cost_by_pk(pk_columns: {id: $id}, _set: {price: $price, chipStack: $chipStack, costType: $costType}) {
      id
      price
      chipStack
      costType
    }
  }
`

const GET_COST_QUERY = gql`
  query getCost($id: uuid!) {
    Cost_by_pk(id: $id) {
      id
      price
      chipStack
      costType
    }
  }
`