const {combineReducers} = require('redux')
    , {Map, List} = require('immutable')
    , {JSONLDNode} = require('immutable-jsonld')
    , { UPDATE_INPUT
      , UPDATE_SELECTED_SUGGESTION
      , REQUEST_VOCABS
      , RECEIVE_VOCABS
      , REQUEST_VOCAB
      , RECEIVE_VOCAB
      , RECEIVE_ERROR
      , UPDATE_NODE
      } = require('../actions')

const isFetchingVocabs = (isFetchingVocabs = false, action) => {
  switch (action.type) {
    case REQUEST_VOCABS:
      return true
    default:
      return isFetchingVocabs
  }
}

const availableVocabs = (availableVocabs = List(), action) => {
  switch (action.type) {
    case RECEIVE_VOCABS:
      return action.list
    default:
      return availableVocabs
  }
}

const input = (input = '', action) => {
  switch (action.type) {
    case UPDATE_INPUT:
      return action.input || ''
    case UPDATE_SELECTED_SUGGESTION:
      return action.suggestion.label ? action.suggestion.label : input
    default:
      return input
  }
}

const selectedSuggestion = (selectedSuggestion = {}, action) => {
  switch (action.type) {
    case UPDATE_SELECTED_SUGGESTION:
      return action.suggestion
    default:
      return selectedSuggestion
  }
}

const vocab = (vocab = {info: Map(), isFetching: false}, action) => {
  switch (action.type) {
    case REQUEST_VOCAB:
      return (
        { ...vocab
         , isFetching: true
        }
      )
    case RECEIVE_VOCAB:
      return (
        { ...vocab
        , info: action.info
        , isFetching: false
        }
      )
  }
}

const loadedVocabs = (loadedVocabs = Map(), action) => {
  switch (action.type) {
    case RECEIVE_VOCAB:
    case REQUEST_VOCAB:
      return loadedVocabs.set(
        action.vocab, vocab(loadedVocabs[action.vocab], action))
    case RECEIVE_ERROR:
      console.log(action.error)
    default:
      return loadedVocabs
  }
}

const classes = (classes = Map(), action) => {
  switch (action.type) {
    case RECEIVE_VOCAB:
      return classes.merge(action.classes)

    default:
      return classes
  }
}

const properties = (properties = Map(), action) => {
  switch (action.type) {
    case RECEIVE_VOCAB:
      return properties.merge(action.properties)

    default:
      return properties
  }
}

const node = (node = JSONLDNode(), action) => {
  switch (action.type) {
    case UPDATE_NODE:
        return action.node
    default:
        return node
  }
}

module.exports = combineReducers(
  { isFetchingVocabs
  , availableVocabs
  , input
  , selectedSuggestion
  , loadedVocabs
  , classes
  , properties
  , node
  }
)
