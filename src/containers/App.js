const React = require('react') // eslint-disable-line no-unused-vars
    , h = require('react-hyperscript')
    , {connect} = require('react-redux')
    , {bindActionCreators} = require('redux')
    , {Block, Heading, List, Button} = require('rebass')
    , Editor = require('react-jsonld-editor')
    , Autosuggest = require('rebass-autosuggest')
    , Lowlight = require('react-lowlight')
    , {saveAs} = require('file-saver')
    , { updateInput
      , updateSuggestions
      , updateNode
      , fetchVocab
      } = require('../actions')

Lowlight.registerLanguage('json', require('highlight.js/lib/languages/json'))

const App = (
  { input
  , suggestions
  , getSuggestions
  , vocabularies
  , node
  , classes
  , properties
  , updateInput
  , updateSuggestions
  , updateNode
  , fetchVocab
  }) => (

  h(Block,
    [ vocabularies.isEmpty()
        ? h(Heading, {size: 4, mb: 1}, ['No vocabularies loaded'])
        : h(Block,
            [ h(Heading, {size: 4, mb: 1}, ['Loaded vocabularies:'])
            , h(List, vocabularies
                .map(({title, url}) => h(
                  'a', {href: url, target: '_blank'}, title))
                .toArray()
               )
            ])

    , h(Autosuggest,
        { name: 'vocabulary'
        , label: 'Add vocabulary'
        , hideLabel: true
        , suggestions
        , onSuggestionsFetchRequested:
            ({value}) => updateSuggestions(getSuggestions(value))
        , onSuggestionsClearRequested:
            () => updateSuggestions([])
        , getSuggestionValue:
            suggestion => suggestion.label
        , renderSuggestion:
            suggestion => suggestion.label
        , onSuggestionSelected:
            (e, {suggestion}) => fetchVocab(suggestion.id)
        , inputProps:
            { value: input
            , placeholder: 'Add vocabulary'
            , onChange: (e, {newValue, method}) => {
                if (method === 'type') { updateInput(newValue) }
              }
            }
        }
      )

    , ...(vocabularies.isEmpty()
        ? []
        : [ h(Editor,
            { node
            , classes
            , properties
            , onSave: node => updateNode(node)
            })
          , h(Lowlight,
            { language: 'json'
            , value: JSON.stringify(node.toJS(), null, 2)
            })
          , h(Button,
            {onClick: () => saveAs(
              new Blob([JSON.stringify(node.toJS(), null, 2)],
                {type: 'application/ld+json;charset=utf-8'}),
              'exported.json')
            }, 'Save')
          ])
    ]
  )
)

const matches = (inputValue, inputLength) => prefix => prefix
  ? prefix.toLowerCase().slice(0, inputLength) === inputValue
  : false

const getSuggester = vocabs => input => {
  const inputValue = String(input).trim().toLowerCase()
  const inputLength = inputValue.length
  const matchesInput = matches(inputValue, inputLength)
  return inputLength === 0
    ? []
    : vocabs
        .filter(vocab => (
          matchesInput(vocab.prefix) ||
          matchesInput(vocab.titles[0].value)))
        .map(vocab => (
          { id: vocab.uri
          , label: vocab.titles[0].value
          }))
        .toArray()
}

const mapStateToProps = (state) => (
  { input: state.input
  , suggestions: state.suggestions
  , getSuggestions: getSuggester(state.availableVocabs)
  , vocabularies:
      state.loadedVocabs
        .valueSeq()
        .filterNot(vocab => vocab.isFetching)
        .map(vocab => (
          { title: vocab.info.get('titles').first().get('value')
          , url: vocab.info.get('uri')
          }
        ))
  , node: state.node
  , classes: state.classes
  , properties: state.properties
  }
)

const mapDispatchToProps = dispatch => bindActionCreators(
  {updateInput, updateSuggestions, updateNode, fetchVocab}, dispatch)

module.exports = connect(mapStateToProps, mapDispatchToProps)(App)
