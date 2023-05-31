import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, View} from 'react-native'
import { FormView, Picker, SubmitButton, MyInput, DeleteButton, } from '../components/FormComponents'
import { dictionaryLookup, } from '../utilities/functions'
import { ErrorMessage } from '../components/ErrorMessage'
import * as ScreenOrientation from 'expo-screen-orientation'

export const CostEditScreen = (props) => {
  useEffect(()=> {
    async function lockPortraitOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    lockPortraitOrientation()
  }, [props.navigation])
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_COST_QUERY, {variables: {id: props.route.params.id}})
  const [ deleteCost, {loading: deletingCost, data: deleteCostData, error: deleteCostError} ] = useMutation(DELETE_COST_MUTATION, {
    variables: {
      id: props.route.params.id
    }
  })
  const [updateCost] = useMutation(UPDATE_COST_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  useEffect(()=>{
    if (data) {
      setInitialValues(data.costs_by_pk)
      setFormValues(data.costs_by_pk)
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
            title="Price"
            value={formValues.price.toString().replace(/^0+/, '')}
            placeholder="Enter price here..."
            onChangeText={(text) => handleInputChange('price', (!text ? 0 : text))}
            keyboardType="numeric"
          />
          <MyInput
            title="Chips"
            value={parseInt(formValues.chipStack).toString().replace(/^0+/, '')}
            placeholder="Enter chip value..."
            onChangeText={(text) => handleInputChange('chipStack', (!text ? 0 : text))}
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
        </View>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <DeleteButton
            mutation={deleteCost}
            navigation={()=> props.navigation.goBack()}
            confirmationString={'Are you sure you want to delete this entry fee?'}
            confirmationTitleString='Confirm Deletion'
          />
          <SubmitButton 
            mutation={updateCost}
            // disabled={!isDirty()}
            navigation={()=> props.navigation.goBack()}
          />
        </View>
      </FormView>        
    )
  }
  return null
}

const UPDATE_COST_MUTATION = gql`
  mutation UpdateCost($price: numeric = 0, $chipStack: Int = 0, $costType: cost_types_enum = Buyin, $id: uuid!) {
    update_costs_by_pk(pk_columns: {id: $id}, _set: {price: $price, chipStack: $chipStack, costType: $costType}) {
      id
      price
      chipStack
      costType
    }
  }
`
const DELETE_COST_MUTATION = gql`
  mutation DeleteCost($id: uuid!) {
    delete_costs_by_pk(id: $id) {
      id
    }
  }
`
const GET_COST_QUERY = gql`
  query Cost($id: uuid!) {
    costs_by_pk(id: $id) {
      id
      price
      chipStack
      costType
    }
  }
`