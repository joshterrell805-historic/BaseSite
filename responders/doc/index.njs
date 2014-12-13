module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('BaseSite:Responders:doc:index');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);
Responder.prototype.methods = {
  'GET': function* GET(cont) {
    this.pageTitle = 'Documents';
    var context = {};
    var index = yield cont.p(Doc.getIndex(this.session));
    context.index = index;
    context.title = 'Documents';
    // TODO create button
    if (this.session) {
      this.scripts.push({type: 'code', code: '$(function() {' +
          'PageActions.add({id:"create", href:"/doc/new", ' +
          'tooltip:"New"});PageActions.enable("create");});'});
    }
    this.stylesheets.push('/base/css/shared/indexes.css');
    return this.renderPage('/shared/indexPage', context);
  },
}
