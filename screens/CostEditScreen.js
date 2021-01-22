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
      setInitialValues(data.costs_by_pk)
      setFormValues(data.costs_by_pk)
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
          value={(formValues.cost_amount || 0).toString()}
          placeholder="Enter price here..."
          onChangeText={(text) => handleInputChange('cost_amount', !text ? 0 : text)}
          keyboardType="numeric"
        />
        <MyInput
          title="Chips"
          value={(formValues.cost_chipstack || 0).toString()}
          placeholder="Enter chip value..."
          onChangeText={(text) => handleInputChange('cost_chipstack', parseInt(!text ? 0 : text))}
          keyboardType="numeric"
        />
        <Picker
          prompt="Choose entry fee type"
          title="Entry Fee Type"
          initialValue={initialValues.cost_type_name || "Pick entry fee type..."}
          selectedValue={formValues.cost_type_name}
          onValueChange={(itemValue, itemIndex) => handleInputChange('cost_type_name', itemValue)}
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
  mutation updateCost($cost_amount: numeric = 0, $cost_chipstack: Int = 0, $cost_type_name: cost_types_enum = Buyin, $id: Int!) {
    update_costs_by_pk(pk_columns: {id: $id}, _set: {cost_amount: $cost_amount, cost_chipstack: $cost_chipstack, cost_type_name: $cost_type_name}) {
      id
      cost_amount
      cost_chipstack
      cost_type_name
    }
  }
`

const GET_COST_QUERY = gql`
  query getCost($id: Int!) {
    costs_by_pk(id: $id) {
      id
      cost_amount
      cost_chipstack
      cost_type_name
    }
  }
`