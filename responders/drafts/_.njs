module.exports = Responder;

var Draft = lib('Content/Draft'),
    debug = require('debug')('BaseSite:Responders:drafts:_');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET(cont) {
    var context = {};
    if (!this.session) {
      context.loggedIn = false;
      this.setResponseCode('401');
      this.pageTitle = 'You must be logged in to edit drafts.';
    } else {
      context.loggedIn = true;
      var draft = yield cont.p(Draft.find(Draft.pathnameToId(this.pathname)));
      if (!draft) {
        this.setResponseCode('404');
        this.pageTitle = 'Draft not found.';
        context.notFound = true;
      } else {
        // also set in client
        this.pageTitle = 'Draft: ' + draft.title;
        context.draft = draft.toString();
        this.stylesheets.push('/base/css/CodeMirror/lib/codemirror.css');
        this.stylesheets.push('/base/css/CodeMirror/addon/dialog/dialog.css');
        this.stylesheets.push('/base/css/CodeMirror/theme/twilight.css');
        this.pageActions.push({href: 'javascript:previewDraft()',
            src: '/img/icon/view.png', tooltip: 'View'});
        this.pageActions.push({href: 'javascript:editDraft()',
            src: '/img/icon/edit.png', tooltip: 'Edit', hidden: true});
        this.pageActions.push({href: 'javascript:submitDraft()',
            src: '/img/icon/submit.png', tooltip: 'Submit'});
        this.scripts = this.scripts.concat([{
          type: 'url',
          url: '/base/js/CodeMirror/lib/codemirror.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/addon/mode/overlay.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/addon/dialog/dialog.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/addon/search/searchcursor.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/clike/clike.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/addon/edit/matchbrackets.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/keymap/vim.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/xml/xml.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/markdown/markdown.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/gfm/gfm.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/javascript/javascript.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/htmlmixed/htmlmixed.js'
        },{
          type: 'url',
          url: '/base/js/CodeMirror/mode/css/css.js'
        },{
          type: 'url',
          url: '/base/js/md5.js'
        }]);
      }
    }

    this.stylesheets.push('/base/css/drafts/_.css');
    this.scripts.push({
      type: 'url',
      url: '/base/js/drafts/_.js'
    });
    return this.renderPage(__filename, context);
  },
  'POST': function* POST(cont) {
    if (!this.session)
      return this.redirect('303', this.pathname);

    this.validateCsrf();
    var draft = yield cont.p(Draft.find(Draft.pathnameToId(this.pathname)));
    debug(draft);
    var doc = yield cont.p(draft.submit());
    debug(doc);
    return this.redirect('303', '/' + doc.doctype + 's/' + doc.title);
  },
};
