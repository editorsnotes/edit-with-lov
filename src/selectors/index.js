const {createSelector} = require('reselect')

const getInput = state => state.input
const getAvailableVocabs = state => state.availableVocabs

const matches = (inputValue, inputLength) => prefix => prefix
  ? prefix.toLowerCase().slice(0, inputLength) === inputValue
  : false

exports.getVocabSuggestions = createSelector(
  [getInput, getAvailableVocabs],
  (input, vocabs) => {
  const inputValue = String(input).trim().toLowerCase()
  const inputLength = inputValue.length
  const matchesInput = matches(inputValue, inputLength)
  return inputLength === 0
    ? []
    : vocabs
        .filter(vocab => (
          matchesInput(vocab.prefix) ||
          matchesInput(vocab.titles[0].value)))
        .map(vocab => ({id: vocab.uri, label: vocab.titles[0].value}))
        .toArray()
})

