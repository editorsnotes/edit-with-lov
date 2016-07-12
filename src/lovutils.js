const _ = require('highland')
    , N3 = require('n3')
    , { isBlank
      , isLiteral
      , getLiteralValue
      , getLiteralLanguage
      } = N3.Util
    , request = require('request')
    , {Map, List, Set, fromJS} = require('immutable')
    , {JSONLDNode, JSONLDValue} = require('immutable-jsonld')
    , ns = require('rdf-ns')

const LOV_V2 = 'https://lov.okfn.org/dataset/lov/api/v2'
const VOCAB_LIST = `${LOV_V2}/vocabulary/list`
const VOCAB_INFO = `${LOV_V2}/vocabulary/info?vocab=`

const owl = ns('http://www.w3.org/2002/07/owl#')
    , rdf = ns('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    , rdfs = ns('http://www.w3.org/2000/01/rdf-schema#')
    , skos = ns('http://www.w3.org/2004/02/skos/core#')

const CLASS_TYPES = Set.of(
  owl('Class'),
  rdfs('Class'),
  rdfs('Datatype')
)

const PROPERTY_TYPES = Set.of(
  owl('ObjectProperty'),
  owl('DatatypeProperty'),
  owl('AnnotationProperty'),
  owl('OntologyProperty'),
  rdf('Property')
)

const rollup = predicates => (results, triple) => (
  predicates.has(triple.predicate)
    ? results.update(triple.subject, JSONLDNode({'@id': triple.subject}),
        node => node.update(
          triple.predicate === rdf('type') ? '@type' : triple.predicate,
          List(),
          list => list.push(isLiteral(triple.object)
            ? JSONLDValue(
                { '@value': getLiteralValue(triple.object)
                , '@language': getLiteralLanguage(triple.object)
                })
            : triple.predicate === rdf('type')
                ? triple.object
                : JSONLDNode({'@id': triple.object})
          )
        )
      )
    : results
)

const isClass = node => node.types.intersect(CLASS_TYPES).size > 0
const isProperty = node => node.types.intersect(PROPERTY_TYPES).size > 0

const PREDICATES = Set.of(
  rdf('type'), rdfs('range'), rdfs('label'), skos('prefLabel')
)

const requestJSON = uri => _(request(uri))
  // collect chunks of data into an array
  .collect()
  // concatenate into a single buffer
  .map(Buffer.concat)
  // parse JSON
  .map(buffer => JSON.parse(buffer.toString('utf8')))

const hasInRange = (node, id) => node
  .get(rdfs('range'), List())
  .some(node => node.id === id)

const inferDatatypeProperties = node => hasInRange(node, rdfs('Literal'))
  ? node.push('@type', owl('DatatypeProperty'))
  : node

const parseClassesAndProperties = url => _(request(url).pipe(N3.StreamParser()))
  // ignore blank nodes
  .reject(triple => isBlank(triple.subject))
  // group into JSON-LD nodes with specified predicates
  .reduce(Map(), rollup(PREDICATES))
  // stream over values
  .flatMap(map => _(map.valueSeq()))
  // ignore resources without labels
  .reject(node => node.preferredLabel() === undefined)
  // infer datatype properties
  .map(inferDatatypeProperties)
  // split into classes and properties
  .reduce({}, ({classes = Map(), properties = Map()}, node) => (
    isClass(node)
      ? ({classes: classes.set(node.id, node), properties})
      : isProperty(node)
          ? ({classes, properties: properties.set(node.id, node)})
          : {classes, properties}
    ))

const getLatestVersionURL = info => List(info.versions)
  .first()
  .fileURL.replace(/^http:/, 'https:')

exports.getVocabulary = vocab => new Promise((resolve, reject) => {
  requestJSON(`${VOCAB_INFO}${encodeURIComponent(vocab)}`)
    .stopOnError(reject)
    .apply(info => parseClassesAndProperties(getLatestVersionURL(info))
      .stopOnError(reject)
      .apply(o => resolve(Object.assign({}, {info: fromJS(info)}, o)))
    )
})

exports.getVocabularies = () => new Promise((resolve, reject) => {
  requestJSON(VOCAB_LIST)
    .stopOnError(reject)
    .apply(vocabularies => resolve(List(vocabularies)))
})
