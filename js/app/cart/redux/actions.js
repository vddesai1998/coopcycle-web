import { createAction } from 'redux-actions'

export const FETCH_REQUEST = 'FETCH_REQUEST'

export const fetchRequest = createAction(FETCH_REQUEST)

export const ADD_ITEM_SUCCESS = 'ADD_ITEM_SUCCESS'
export const ADD_ITEM_FAILURE = 'ADD_ITEM_FAILURE'

export const addItemSuccess = createAction(ADD_ITEM_SUCCESS)
export const addItemFailure = createAction(ADD_ITEM_FAILURE)

export const REMOVE_ITEM_SUCCESS = 'REMOVE_ITEM_SUCCESS'
export const REMOVE_ITEM_FAILURE = 'REMOVE_ITEM_FAILURE'

export const removeItemSuccess = createAction(REMOVE_ITEM_SUCCESS)
export const removeItemFailure = createAction(REMOVE_ITEM_FAILURE)

export function addItem(itemURL, quantity = 1) {

  return dispatch => {
    dispatch(fetchRequest())

    return $.post(itemURL, { quantity })
      .then(res => dispatch(addItemSuccess(res)))
      .fail(e => dispatch(addItemFailure(e.responseJSON)))
  }
}

export function removeItem(itemID) {

  return (dispatch, getState) => {

    dispatch(fetchRequest())

    const fetchParams = {
      url: getState().removeFromCartURL.replace('__CART_ITEM_ID__', itemID),
      type: 'DELETE',
    }

    return $.ajax(fetchParams)
      .then(res => dispatch(removeItemSuccess(res)))
      .fail(e => dispatch(removeItemFailure(e.responseJSON)))
  }
}
