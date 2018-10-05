import React from 'react'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { render, findDOMNode } from 'react-dom'

import i18n from '../i18n'
// import store from './redux/store'
import { createStoreFromPreloadedState } from './redux/store'
import Cart from './components/Cart'

import { addItem } from './redux/actions'

window.CoopCycle = window.CoopCycle || {}
window.CoopCycle.Cart = (el, preloadedState) => {

  // console.log(preloadedState)

  const store = createStoreFromPreloadedState(preloadedState)

  render(
    <Provider store={ store }>
      <I18nextProvider i18n={ i18n }>
        <Cart />
      </I18nextProvider>
    </Provider>,
    el
  )

  return {
    addItem: (itemURL, quantity = 1) => store.dispatch(addItem(itemURL, quantity)),
  }
}
