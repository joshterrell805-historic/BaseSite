module.exports = Responder;

var assert = require('assert'),
    Session = lib('Session'),
    debug = require('debug')('BaseSite:Responders:login'),
    cookie = require('cookie');

function Responder() {
   GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
   'GET': function* GET(cont, res) {
      this.stylesheets.push('/base/css/login.css');
      var code = this.query.code;
      var state = this.query.state;
      if (code && state) {
        try {
          var session = yield cont.p(Session.login(code, state));
          debug('login session: %o', session);
          if (!session.id) {
            var errorMessage = 'This email is not associated with an account.';
          }
        } catch (e) {
          switch(e.code) {
          case 'INVALID_CSRF':
          case 'INVALID_JSON':
          case 'MISSING_FIELD':
            debug(e);
            var errorMessage = 'Something went wrong when logging you in.';
            break;
          default:
            throw e;
            break;
          }
        }

        assert(!!errorMessage != (session && !!session.id));
        var loggedIn = !errorMessage;
      } else {
        var loggedIn = !!this.session;
      }


      if (session && session.created) {
        var opts = {
          path: '/',
          expires: session.expired ? new Date() :
                new Date(Date.now() + 1000*60*60*24*365*10),
          secure: true,
          httpOnly: true
        };
        var cookieStr = cookie.serialize('sessionId', session.id, opts);
        this.res.setHeader('Set-Cookie', cookieStr);
      }

      this.displayPage(__filename, {
        loggedIn: loggedIn,
        loginUrl: loggedIn ? '/' : Session.generateOauthUrl(),
        errorMessage: errorMessage,
      });
   }
};
