module.exports = Responder;

var Doc = lib('Content/Doc');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET(cont) {
    var doc = yield cont.p(Doc.findByTitle(Doc.pathnameToTitle(this.pathname)));

    if (!doc) {
      this.setResponseCode('404');
      this.pageTitle = 'Post Not Found';
      var context = {
        notFound: true,
      };
    } else if (this.session && this.query.edit !== undefined) {
      return this.redirect('303', yield cont.p(doc.getDraftUrl()));
    } else if (doc.private && !this.session) {
      this.setResponseCode('401');
      this.pageTitle = 'Private Post';
      var context = {
        private: true,
      };
    } else {
      this.pageTitle = doc.title;
      var context = {
        title: doc.title,
        body: yield cont.p(renderMarkdown(doc.body)),
        publishTimestamp: doc.publish_ts.getTime() / 1000,
      };
    }
    if (this.session && doc) {
      this.pageActions.push({href: this.pathname + '?edit',
          src: '/img/icon/edit.png', tooltip: 'Edit'});
    }

    this.stylesheets.push('/base/css/posts/_.css');
    return this.renderPage(__filename, context);
  },
};
