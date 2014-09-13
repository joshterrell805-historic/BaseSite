module.exports = renderPage;

var debug = require('debug')('basesite:helpers:renderPage');

function renderPage(page, context) {
   debug('rendering %s', page);
   var template = handlebars.partials[page];
   var rendered = template(context);
   return rendered;
}
