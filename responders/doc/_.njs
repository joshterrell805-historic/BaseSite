module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('BaseSite:responders:doc:_');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET(cont) {
    var doc = yield cont.p(Doc.findByTitle(Doc.pathnameToTitle(this.pathname)));

    if (!doc || (doc.private && !this.session)) {
      this.setResponseCode('404');
      this.pageTitle = 'Document Not Found';
      var context = {
        notFound: true,
      };
    } else {
      this.pageTitle = doc.title;
      var context = _.defaults({doc: doc}, yield cont.p(doc.getRenderContext()));

      if (this.session) {
        for (var i = 0; i < stylesheets.length; ++i)
          this.stylesheets.push(stylesheets[i]);
        for (var i = 0; i < scripts.length; ++i)
          this.scripts.push({type: 'url', url: scripts[i]});
      }
    }

    this.stylesheets.push('/base/css/doc/_.css');
    return this.renderPage(__filename, context);
  },
};

var scripts = [
  '/base/js/CodeMirror/lib/codemirror.js',
  '/base/js/CodeMirror/addon/mode/overlay.js',
  '/base/js/CodeMirror/addon/dialog/dialog.js',
  '/base/js/CodeMirror/addon/search/searchcursor.js',
  '/base/js/CodeMirror/mode/clike/clike.js',
  '/base/js/CodeMirror/addon/edit/matchbrackets.js',
  '/base/js/CodeMirror/keymap/vim.js',
  '/base/js/CodeMirror/mode/xml/xml.js',
  '/base/js/CodeMirror/mode/markdown/markdown.js',
  '/base/js/CodeMirror/mode/gfm/gfm.js',
  '/base/js/CodeMirror/mode/javascript/javascript.js',
  '/base/js/CodeMirror/mode/htmlmixed/htmlmixed.js',
  '/base/js/CodeMirror/mode/css/css.js',
  '/base/js/md5.js',
  '/base/js/doc/_.js',
];
var stylesheets = [
  '/base/css/CodeMirror/lib/codemirror.css',
  '/base/css/CodeMirror/addon/dialog/dialog.css',
  '/base/css/CodeMirror/theme/twilight.css',
];
