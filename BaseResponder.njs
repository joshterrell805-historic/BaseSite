module.exports = BaseResponder;

var jugglypuff = require('jugglypuff'),
    debug = require('debug')('basesite:BaseResponder'),
    Session = lib('Session'),
    cookie = require('cookie');

function BaseResponder() {
  jugglypuff.Responder.apply(this, arguments);
}

BaseResponder.prototype = Object.create(jugglypuff.Responder.prototype);

BaseResponder.prototype.resetCsrf = function resetCsrf() {
    this.setCookie('csrf', Session.csrf(), {
      expires: new Date(Date.now() + 1000*60*60*24*365*10),
      httpOnly: false
    }, true);
};

// @Override
BaseResponder.prototype.respond = function respond() {
  var args = arguments;
  this.cookies = this.req.headers.cookie ?
      cookie.parse(this.req.headers.cookie) : {};
  debug("cookies: %o", this.cookies);

  if (!this.cookies || !this.cookies.csrf) {
    this.resetCsrf();
  }

  // restore the session if exists.
  Session.parseRequest(this.cookies)
  .then(null, function(err) {
    // this is a sql error
    debug(err);
    return null;
  }).done(function(session) {
    this.session = session;
    debug("session: %o", session);
    if (session && session.expired) {
      debug("session expired; deleting cookie");
      this.setHeader('Set-Cookie', this.deleteSessionCookieStr);
      this.session = null;
    }
    jugglypuff.Responder.prototype.respond.apply(this, args);
  }.bind(this));
};

/**
 * should be called in every post request.
 */
BaseResponder.prototype.validateCsrf = function validateCsrf() {
  if (!this.cookies.csrf || (this.req.headers.csrf !== this.cookies.csrf)) {
    throw new Error('Invalid CSRF');
  }
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
BaseResponder.prototype.onUnhandledError =
    function onUnHandledError(err) {
  var debug = require('debug')('basesite:unhandledMethodError');
  debug(err);
  // TODO if (err.message === 'Invalid CSRF')
  this.setResponseCode('500', true);
  var message = site.config.isProduction ?
   '500: Unexpected Server Error' : err.toString();
  return message;
};

BaseResponder.prototype.deleteSessionCookieStr = 'sessionId=CookieDeleted; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure';
