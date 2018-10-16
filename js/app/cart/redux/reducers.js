import { combineReducers } from 'redux'

import {
  FETCH_REQUEST,
  ADD_ITEM_SUCCESS,
  ADD_ITEM_FAILURE,
  REMOVE_ITEM_SUCCESS,
  REMOVE_ITEM_FAILURE,
} from './actions'

const initialState = {
  isFetching: false,
  items: [],
  itemsTotal: 0,
  total: 0,
  removeFromCartURL: '',
  errors: [],
  errorsKeys: [],
  availabilities: [],
}

const isFetching = (state = initialState.isFetching, action = {}) => {
  switch (action.type) {
    case FETCH_REQUEST:
      return true
    case ADD_ITEM_SUCCESS:
    case ADD_ITEM_FAILURE:
    case REMOVE_ITEM_SUCCESS:
    case REMOVE_ITEM_FAILURE:
      return false
    default:
      return state
  }
}

const items = (state = initialState.items, action = {}) => {
  switch (action.type) {
    case ADD_ITEM_SUCCESS:
    case ADD_ITEM_FAILURE:
    case REMOVE_ITEM_SUCCESS:
    case REMOVE_ITEM_FAILURE:
      const { cart } = action.payload
      return cart.items
    default:
      return state
  }
}

const itemsTotal = (state = initialState.itemsTotal, action = {}) => {
  switch (action.type) {
    case ADD_ITEM_SUCCESS:
    case ADD_ITEM_FAILURE:
    case REMOVE_ITEM_SUCCESS:
    case REMOVE_ITEM_FAILURE:
      const { cart } = action.payload
      return cart.itemsTotal
    default:
      return state
  }
}

const total = (state = initialState.total, action = {}) => {
  switch (action.type) {
    case ADD_ITEM_SUCCESS:
    case ADD_ITEM_FAILURE:
    case REMOVE_ITEM_SUCCESS:
    case REMOVE_ITEM_FAILURE:
      const { cart } = action.payload
      return cart.total
    default:
      return state
  }
}

const removeFromCartURL = (state = initialState.removeFromCartURL, action = {}) => {
  switch (action.type) {
    default:
      return state
  }
}

const errors = (state = initialState.errors, action = {}) => {
  switch (action.type) {
    case ADD_ITEM_FAILURE:
    case REMOVE_ITEM_FAILURE:
      const { errors } = action.payload

      if (errors) {
        let newState = []
        _.forEach(errors, (messages, key) => {
          newState = newState.concat(messages)
        })

        return newState
      }
    case ADD_ITEM_SUCCESS:
    case ADD_ITEM_FAILURE:
      return []
    default:
      return state
  }
}

const errorsKeys = (state = initialState.errorsKeys, action = {}) => {
  switch (action.type) {
    default:
      return state
  }
}

const availabilities = (state = initialState.availabilities, action = {}) => {
  switch (action.type) {
    default:
      return state
  }
}

export default combineReducers({
  isFetching,
  items,
  itemsTotal,
  total,
  removeFromCartURL,
  errors,
  errorsKeys,
  availabilities,
})
