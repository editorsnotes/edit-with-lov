const React = require('react')
    , h = require('react-hyperscript')
    , {createStore, applyMiddleware, compose} = require('redux')
    , {Provider} = require('react-redux')
    , thunk = require('redux-thunk').default
    , {fetchVocabs} = require('./actions')
    , reducer = require('./reducers')
    , App = require('./containers/App')

module.exports = React.createClass({
  displayName: 'LOVLinkedDataEditor',

  getDefaultProps() {
    return {
      store: createStore(
        reducer,
        compose(
          applyMiddleware(thunk),
          global.devToolsExtension ? global.devToolsExtension() : f => f
        )
      )
    }
  },

  componentDidMount() {
    const {store} = this.props

    store.dispatch(fetchVocabs())
  },

  render() {
    return h(Provider, this.props, h(App))
  }
})
