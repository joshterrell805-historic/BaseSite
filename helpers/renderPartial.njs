module.exports = renderPage;

var debug = require('debug')('basesite:helpers:renderPage');

function renderPage(page, context) {
   debug('rendering %s', page);
   var template = handlebars.partials[page];
   if (!template) throw new Error('partial ' + page + ' not found');
   var rendered = template(context);
   return rendered;
}
