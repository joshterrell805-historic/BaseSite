module.exports = Responder;

var Doc = lib('Content/Doc');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET(cont, res) {
    var doc = yield cont.p(Doc.findByTitle(Doc.pathnameToTitle(this.pathname)));

    if (!doc) {
      res.writeHead('404');
      this.pageTitle = 'Post Not Found';
      var context = {
        notFound: true,
      };
    } else if (doc.private && !this.session) {
      res.writeHead('401');
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

    this.stylesheets.push('/base/css/posts/_.css');
    this.displayPage(__filename, context);
  },
};
