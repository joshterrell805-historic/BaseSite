module.exports = Responder;

var Draft = lib('Content/Draft'),
    debug = require('debug')('BaseSite:Responders:drafts:index');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);
Responder.prototype.methods = {
  'GET': function* GET(cont) {
    var context = {};
    var index = yield cont.p(Draft.getIndex(this.session));
    context.index = index;
    context.title = 'Drafts';
    // TODO create button
    if (this.session) {
      this.pageActions.push({href: 'new',
          src: '/img/icon/submit.png', tooltip: 'New'});
    }
    this.stylesheets.push('/base/css/shared/indexes.css');
    return this.renderPage('/shared/indexPage', context);
  },
}
