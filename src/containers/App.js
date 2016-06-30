const React = require('react') // eslint-disable-line no-unused-vars
    , {connect} = require('react-redux')
    , {bindActionCreators} = require('redux')
    , Editor = require('react-jsonld-editor')
    , {AddSuggestion} = Editor.components
    , { updateInput
      , updateSelectedSuggestion
      , updateNode
      , fetchVocab
      } = require('../actions')
    , {getVocabSuggestions} = require('../selectors')

const App = props => (
  <div>
    <span className="inline-block mb1">Loaded vocabularies:</span>
    {props.vocabularies.isEmpty()
      ? ' none'
      : (
          <ul>
          {props.vocabularies.map((v,i) => <li key={`vocab-${i}`}>{v}</li>)}
          </ul>
        )
    }
    <AddSuggestion {...props} />
    <Editor {...props} />
  </div>
)

const getTitle = vocab => vocab.info.get('titles').first().get('value')

const mapStateToProps = (state) => (
  { vocabularies:
      state.loadedVocabs
        .valueSeq()
        .filterNot(vocab => vocab.isFetching)
        .map(getTitle)
  , input: state.input
  , suggestions: getVocabSuggestions(state)
  , selectedSuggestion: state.selectedSuggestion
  , classes: state.classes
  , properties: state.properties
  , node: state.node
  }
)

const mapDispatchToProps = dispatch => (
  { onChange:
      e => dispatch(updateInput(e.target.value))
  , onSuggestionSelected:
      (_, {suggestion}) => dispatch(updateSelectedSuggestion(suggestion))
  , onSave:
      node => dispatch(updateNode(node))
  , fetchVocab:
      bindActionCreators(fetchVocab, dispatch)
  }
)

const mergeProps = (stateProps, dispatchProps) => (
  { ...stateProps
  , ...dispatchProps
  , onAdd: stateProps.selectedSuggestion.id
      ? () => dispatchProps.fetchVocab(stateProps.selectedSuggestion.id)
      : null
  }
)

module.exports = connect(mapStateToProps, mapDispatchToProps, mergeProps)(App)
