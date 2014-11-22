module.exports = BaseResponder;

var jugglypuff = require('jugglypuff'),
    debug = require('debug')('basesite:BaseResponder'),
    Session = lib('Session'),
    cookie = require('cookie');

function BaseResponder() {
  jugglypuff.Responder.apply(this, arguments);
}

BaseResponder.prototype = Object.create(jugglypuff.Responder.prototype);

// @Override
BaseResponder.prototype.respond = function respond() {
  var args = arguments;
  this.cookies = this.req.headers.cookie ?
      cookie.parse(this.req.headers.cookie) : {};
  // TODO remove me and make button
  console.log(this.pathname);
  console.log(Session.generateOauthUrl(this.pathname));
  debug(this.cookies);

  // create or restore the session.
  Session.parseRequest(this.query, this.cookies).done(function(session) {
    this.session = session;
    debug(session);

    if (session) {
      var opts = {
        path: '/',
        expires: session.expired ? new Date() :
              new Date(Date.now() + 1000*60*60*24*365*10),
        secure: true,
        httpOnly: true
      };
      var cookieStr = cookie.serialize('sessionId', session.id, opts);

      // invalid email, can't login
      // TODO, create account? show "you can't login" page?
      if (!session.id) {
        this.res.writeHead('303', {'Location': session.redirectUrl});
        this.res.end();
        return;
      }

      if (session.created) {
        this.res.writeHead('303', {
            'Location': session.redirectUrl,
            'Set-Cookie': [cookieStr]});
        this.res.end();
        return;
      } else if (session.expired) {
        this.res.setHeader('Set-Cookie', cookieStr);
        this.session = null;
      }
    }

    jugglypuff.Responder.prototype.respond.apply(this, args);
  }.bind(this), this.onUnhandledMethodError.bind(this));
};

BaseResponder.prototype.modulePathToPageName =
 function modulePathToPageName(_filename) {
   // is this a base responder or site responder?
   if (_filename.startsWith(site._baseConfig.responderRoot)) {
      var responderRoot = site._baseConfig.responderRoot;
      var responderExtension = '.njs';
   } else {
      var responderRoot = site.config.responderRoot;
      var responderExtension = site.config.responderExtension;
   }

   var pageName = _filename.substr(0, _filename.length -
    responderExtension.length);
   pageName = pageName.substr(responderRoot.length) + 'Page';
   debug('convert module to page: %s -> %s', _filename, pageName);
   return pageName;
};

// @override
BaseResponder.prototype.onUnhandledMethodError =
 function onUnHandledMethodError(err) {
   var debug = require('debug')('basesite:unhandledMethodError');
   debug(err);
   this.res.writeHead('500');
   var message = site.config.isProduction ?
    '500: Unexpected Server Error' : err.toString();
   this.res.end(message);
};
