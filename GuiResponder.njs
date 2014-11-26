module.exports = GuiResponder;

var BaseResponder = require('./BaseResponder.njs'),
    debug = require('debug')('basesite:GuiResponder'),
    Session = lib('Session');

function GuiResponder() {
   BaseResponder.apply(this, arguments);

   this.stylesheets = [
      '//cdnjs.cloudflare.com/ajax/libs/foundation/5.3.3/css/normalize.min.css',
      '//cdnjs.cloudflare.com/ajax/libs/foundation/5.3.3/css/foundation.min.css',
      '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.2/styles/solarized_dark.min.css',
      '/base/css/global.css',
   ];

   this.scripts = [{
      type: 'url',
      url: '//code.jquery.com/jquery-2.1.1.min.js',
   },{
      type: 'url',
      url: '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.2/highlight.min.js',
   },{
      type: 'code',
      code: 'hljs.initHighlightingOnLoad();',
   },{
      type: 'url',
      url: '/base/js/TimestampToDate.js',
   }];

   // [{href, src}}]
   this.pageActions = [];
   // TODO temp
   this.pageActions.push({href: 'javascript:alert("ya clicked me")', src: '/img/icon/view.png', tooltip: 'View'});
   this.pageActions.push({href: 'javascript:alert("ya clicked me")', src: '/img/icon/edit.png', tooltip: 'Edit'});
   this.pageActions.push({href: 'javascript:alert("ya clicked me")', src: '/img/icon/private.png', tooltip: 'Make Private'});
   this.pageActions.push({href: 'javascript:alert("ya clicked me")', src: '/img/icon/public.png', tooltip: 'Make Public'});
   this.pageActions.push({href: 'javascript:alert("ya clicked me")', src: '/img/icon/submit.png', tooltip: 'Submit'});
}

GuiResponder.prototype = Object.create(BaseResponder.prototype);

GuiResponder.prototype.pageTitle = site.config.title;

/* the name of the partial that is used as the base page for this page */
GuiResponder.prototype.basePagePartial = '/shared/page';

/**
 * Render the page then send it as the response and end the connection.
 */
GuiResponder.prototype.displayPage = function displayPage(pageName, context) {
   var rendered = this.renderPage(pageName, context);
   this.res.end(rendered);
};

/**
 * Render the page corresponding to `path` which is __filename from within
 *  the responder module that wants to render.
 */
GuiResponder.prototype.renderPage = function renderPage(pageName, context) {
   if (pageName.endsWith(site.config.responderExtension)) {
      pageName = this.modulePathToPageName(pageName);
   }

   var template = handlebars.partials[this.basePagePartial];
   var rendered = template({
      pageTitle: this.pageTitle,
      siteTitle: site.config.title,
      session: this.session,
      loginUrl: this.session ? false : Session.generateOauthUrl(this.pathname),
      stylesheets: this.stylesheets,
      scripts: this.scripts,
      page: pageName,
      pageActions: this.pageActions,
      context: context,
   });

   return rendered;
};
