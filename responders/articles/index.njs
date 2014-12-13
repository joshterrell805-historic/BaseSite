module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('BaseSite:Responders:articles:index');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);
Responder.prototype.methods = {
  'GET': function* GET(cont) {
    this.pageTitle = 'Articles';
    var context = {};
    var index = yield cont.p(Doc.getIndex('article', this.session));
    context.index = index;
    context.title = 'Articles';
    // TODO create button
    if (this.session) {
      this.pageActions.push({href: '/drafts/new?doctype=article',
          src: '/img/icon/submit.png', tooltip: 'New'});
    }
    this.stylesheets.push('/base/css/shared/indexes.css');
    return this.renderPage('/shared/indexPage', context);
  },
}
