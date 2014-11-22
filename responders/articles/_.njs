module.exports = Responder;

var Article = lib('Content/Article');

function Responder() {
   GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
   'GET': function* GET(cont, res) {
      var article = new Article({pathname: this.pathname});
      var exists = yield cont.p(article.exists());

      if (!exists) {
         res.writeHead('404');
         // TODO render 404 responder.
         this.pageTitle = 'Article Not Found';
         var context = {
            notFound: true,
         };
      } else {
         var metaP = article.getField('meta').then(JSON.parse);
         var meta = yield cont.p(metaP);

         // TODO there should be a more global way to do this
         // TODO don't use 301, use 307.
         var redirectUrl = meta['301'];
         if (redirectUrl) {
            res.writeHead('307', {
               'Location': redirectUrl
            });
            res.end();
            return;
         }

         var bodyP = article.getField('body').then(renderMarkdown);
         var body = yield cont.p(bodyP);

         var title = article.title;
         this.pageTitle = title;
         var context = {
            title: title,
            body: body,
            publishTimestamp: meta.publishTimestamp,
            lastEditTimestamp: meta.lastEditTimestamp,
         };
      }

      this.stylesheets.push('/base/css/articles/_.css');
      this.displayPage(__filename, context);
   },
};
