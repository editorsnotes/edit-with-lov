const {getVocabularies, getClassesAndProperties} = require('../lovutils')

const UPDATE_INPUT = 'UPDATE_INPUT'
const UPDATE_SELECTED_SUGGESTION = 'UPDATE_SELECTED_SUGGESTION'
const REQUEST_VOCABS = 'REQUEST_VOCABS'
const RECEIVE_VOCABS = 'RECEIVE_VOCABS'
const REQUEST_VOCAB = 'REQUEST_VOCAB'
const RECEIVE_VOCAB = 'RECEIVE_VOCAB'
const RECEIVE_ERROR = 'RECEIVE_ERROR'
const UPDATE_NODE = 'UPDATE_NODE'

const updateInput = input => (
  { type: UPDATE_INPUT
  , input
  }
)

const updateSelectedSuggestion = suggestion => (
  { type: UPDATE_SELECTED_SUGGESTION
  , suggestion
  }
)

const requestVocabs = () => (
  { type: REQUEST_VOCABS }
)

const receiveVocabs = list => (
  { type: RECEIVE_VOCABS
  , list
  , receivedAt: Date.now()
  }
)

const requestVocab = vocab => (
  { type: REQUEST_VOCAB
  , vocab
  }
)

const receiveVocab = (vocab, {classes, properties}) => (
  { type: RECEIVE_VOCAB
  , vocab
  , classes
  , properties
  , receivedAt: Date.now()
  }
)

const receiveError = error => (
  { type: RECEIVE_ERROR
  , error
  , receivedAt: Date.now()
  }
)

const fetchVocab = vocab => dispatch => {
  dispatch(requestVocab(vocab))
  return getClassesAndProperties(vocab)
    .then(o => dispatch(receiveVocab(vocab, o)))
    .catch(error => dispatch(receiveError(error)))
}

const fetchVocabs = () => dispatch => {
  dispatch(requestVocabs())
  return getVocabularies()
    .then(list => dispatch(receiveVocabs(list)))
    .catch(error => dispatch(receiveError(error)))
}

const updateNode = node => (
  { type: UPDATE_NODE
  , node: node
  }
)

module.exports =
  { UPDATE_INPUT
  , UPDATE_SELECTED_SUGGESTION
  , REQUEST_VOCABS
  , RECEIVE_VOCABS
  , REQUEST_VOCAB
  , RECEIVE_VOCAB
  , RECEIVE_ERROR
  , UPDATE_NODE
  , updateInput
  , updateSelectedSuggestion
  , requestVocabs
  , receiveVocabs
  , requestVocab
  , receiveVocab
  , receiveError
  , fetchVocab
  , fetchVocabs
  , updateNode
  }

