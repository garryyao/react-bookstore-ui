import {createStore, compose} from 'redux'
import reducers from '../reducers'
import {autoRehydrate} from 'redux-persist'
import initialState from '../data';
const store = createStore(reducers, initialState, compose(autoRehydrate()));

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextReducer = require('../reducers').default
    store.replaceReducer(nextReducer)
  })
}

export default store;
