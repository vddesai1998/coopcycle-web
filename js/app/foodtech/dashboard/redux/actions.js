import { createAction } from 'redux-actions'

export const SET_CURRENT_ORDER = 'SET_CURRENT_ORDER'
export const ORDER_EVENT_RECEIVED = 'ORDER_EVENT_RECEIVED'
export const ORDER_CREATED = 'ORDER_CREATED'

export const FETCH_REQUEST = 'FETCH_REQUEST'
export const ACCEPT_ORDER_REQUEST_SUCCESS = 'ACCEPT_ORDER_REQUEST_SUCCESS'
export const ACCEPT_ORDER_REQUEST_FAILURE = 'ACCEPT_ORDER_REQUEST_FAILURE'
export const REFUSE_ORDER_REQUEST_SUCCESS = 'REFUSE_ORDER_REQUEST_SUCCESS'
export const REFUSE_ORDER_REQUEST_FAILURE = 'REFUSE_ORDER_REQUEST_FAILURE'
export const DELAY_ORDER_REQUEST_SUCCESS = 'DELAY_ORDER_REQUEST_SUCCESS'
export const DELAY_ORDER_REQUEST_FAILURE = 'DELAY_ORDER_REQUEST_FAILURE'
export const CANCEL_ORDER_REQUEST_SUCCESS = 'CANCEL_ORDER_REQUEST_SUCCESS'
export const CANCEL_ORDER_REQUEST_FAILURE = 'CANCEL_ORDER_REQUEST_FAILURE'

export const setCurrentOrder = createAction(SET_CURRENT_ORDER)
export const orderEventReceived = createAction(ORDER_EVENT_RECEIVED, (order, event) => ({ order, event }))
export const orderCreated = createAction(ORDER_CREATED)

export const fetchRequest = createAction(FETCH_REQUEST)
export const acceptOrderRequestSuccess = createAction(ACCEPT_ORDER_REQUEST_SUCCESS)
export const acceptOrderRequestFailure = createAction(ACCEPT_ORDER_REQUEST_FAILURE)
export const refuseOrderRequestSuccess = createAction(REFUSE_ORDER_REQUEST_SUCCESS)
export const refuseOrderRequestFailure = createAction(REFUSE_ORDER_REQUEST_FAILURE)
export const delayOrderRequestSuccess = createAction(DELAY_ORDER_REQUEST_SUCCESS)
export const delayOrderRequestFailure = createAction(DELAY_ORDER_REQUEST_FAILURE)
export const cancelOrderRequestSuccess = createAction(CANCEL_ORDER_REQUEST_SUCCESS)
export const cancelOrderRequestFailure = createAction(CANCEL_ORDER_REQUEST_FAILURE)

export function acceptOrder(order) {

  return dispatch => {
    dispatch(fetchRequest())

    const url = window.Routing.generate('admin_order_accept', { id: order.id })

    $.post(url)
      .then(res => dispatch(acceptOrderRequestSuccess(res)))
      .fail(e => dispatch(acceptOrderRequestFailure(res)))
  }
}

export function refuseOrder(order) {

  return dispatch => {
    dispatch(fetchRequest())

    const url = window.Routing.generate('admin_order_refuse', { id: order.id })

    $.post(url)
      .then(res => dispatch(refuseOrderRequestSuccess(res)))
      .fail(e => dispatch(refuseOrderRequestFailure(res)))
  }
}

export function delayOrder(order) {

  return dispatch => {
    dispatch(fetchRequest())

    const url = window.Routing.generate('admin_order_delay', { id: order.id })

    $.post(url)
      .then(res => dispatch(delayOrderRequestSuccess(res)))
      .fail(e => dispatch(delayOrderRequestFailure(res)))
  }
}

export function cancelOrder(order) {

  return dispatch => {
    dispatch(fetchRequest())

    const url = window.Routing.generate('admin_order_cancel', { id: order.id })

    $.post(url)
      .then(res => dispatch(cancelOrderRequestSuccess(res)))
      .fail(e => dispatch(cancelOrderRequestFailure(res)))
  }
}
