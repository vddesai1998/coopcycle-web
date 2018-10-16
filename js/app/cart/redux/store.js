import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import reducers from './reducers'

const middlewares = [ thunk ]

// const preloadedState = { total: 100 }

// let store = createStore(
//   reducers,
//   // preloadedState,
//   compose(
//     applyMiddleware(...middlewares)
//   )
// )

// export default store

export const createStoreFromPreloadedState = preloadedState => {

  console.log(preloadedState)

  console.log(reducers);

  return createStore(
    reducers,
    preloadedState,
    compose(
      applyMiddleware(...middlewares)
    )
  )
}
