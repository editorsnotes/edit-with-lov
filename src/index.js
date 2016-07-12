const React = require('react') // eslint-disable-line no-unused-vars
    , h = require('react-hyperscript')
    , {render} = require('react-dom')
    , {createStore, applyMiddleware, compose} = require('redux')
    , {Provider} = require('react-redux')
    , thunk = require('redux-thunk').default
    , {fetchVocabs} = require('./actions')
    , reducer = require('./reducers')
    , App = require('./containers/App')

const mount = document.createElement('div')
document.body.appendChild(mount)

const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
)

render(
  h(Provider, { store }, h(App)),
  mount
)

store.dispatch(fetchVocabs())
