module.exports = Responder;

var Draft = lib('Content/Draft'),
    debug = require('debug')('BaseSite:Responders:drafts:new');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);
Responder.prototype.methods = {
  'GET': function* GET(cont) {
    this.pageTitle = 'Create Draft';
    if (this.session) {
      var id = yield cont.p(Draft.create({
        body: '',
        title: 'untitled',
      }));
      return this.redirect('303', id);
    }
    this.stylesheets.push('/base/css/shared/notLoggedIn.css');
    return this.renderPage('/shared/notLoggedInPage', {});
  },
}
