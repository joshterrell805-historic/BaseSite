module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('BaseSite:Responders:articles:index');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);
Responder.prototype.methods = {
  'GET': function* GET(cont) {
    var context = {};
    var index = yield cont.p(Doc.getIndex('article', this.session));
    context.index = index;
    context.title = 'Articles';
    // TODO create button
    if (this.session) {
      this.pageActions.push({href: 'new',
          src: '/img/icon/submit.png', tooltip: 'New'});
    }
    this.stylesheets.push('/base/css/shared/indexes.css');
    return this.renderPage('/shared/indexPage', context);
  },
}
