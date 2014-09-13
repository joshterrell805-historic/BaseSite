module.exports = Responder;

var Post = lib('Content/Post');

function Responder() {
   GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
   'GET': function* GET(cont, res) {
      var post = new Post({pathname: this.pathname});
      var exists = yield cont.p(post.exists());

      if (!exists) {
         res.writeHead('404');
         this.pageTitle = 'Post Not Found';
         var context = {
            notFound: true,
         };
      } else {
         var bodyP = post.getField('body').then(renderMarkdown);
         var body = yield cont.p(bodyP);

         var metaP = post.getField('meta').then(JSON.parse);
         var meta = yield cont.p(metaP);

         var title = post.title;
         this.pageTitle = title;
         var context = {
            title: title,
            body: body,
            publishTimestamp: meta.publishTimestamp,
         };
      }

      this.stylesheets.push('/base/css/posts/_.css');
      this.displayPage(__filename, context);
   },
};
