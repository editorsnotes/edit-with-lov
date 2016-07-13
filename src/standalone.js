const h = require('react-hyperscript')
    , {render} = require('react-dom')
    , LOVLinkedDataEditor = require('./')

const mount = document.createElement('div')
document.body.appendChild(mount)

render(h(LOVLinkedDataEditor), mount)
