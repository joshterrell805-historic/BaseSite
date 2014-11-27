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
   'GET': function* GET(cont) {
      this.stylesheets.push('/base/css/login.css');
      var code = this.query.code;
      var state = this.query.state;
      var context = {};
      if (this.session) {
        // POSSIBILITY 1: USER IS ALREADY LOGGED IN
        context.message = 'You are already logged in.';
      } else {
        try {
          var session = yield cont.p(Session.login(code, state,
              this.cookies.csrf));
          debug('login session: %o', session);
          // POSSIBILITY 2: USER ATTEMPTED TO LOGIN BUT NO ACCOUNT
          if (!session.id) {
            context.message = 'Your gmail account has not been authorized to '
              + 'login to this website. '
              + '<a href="mailto:josh@joshterrell.com">Contact me</a> to '
              + 'request authorization.';
          } else if (session.created) {
            // POSSIBILITY 3: USER LOGGED IN SUCCESSFULLY
            context.message = 'You have successfully logged in.';
            this.resetCsrf();
            this.session = session;
            this.setCookie('sessionId', session.id, {
              expires: new Date(Date.now() + 1000*60*60*24*365*10),
            });
          }

          if (session.redirectUrl) {
            // the CSRF was valid which means that this request does not
            // originate from a third party. If the user changed the
            // redirectUrl value that's their own doing.
            context.message += ' Return to <a href="' + session.redirectUrl
                + '">where you came from</a>.';
          };
        } catch (e) {
          // POSSIBILITY 4: AN ERROR OCCURED IN THE LOGIN REQUEST
          switch(e.code) {
          case 'INVALID_CSRF':
          case 'INVALID_JSON':
          case 'MISSING_FIELD':
            debug(e);
            context.message = 'An error occured when logging you in.';
            break;
          default:
            throw e;
            break;
          }
        }
      }

      return this.renderPage(__filename, context);
   }
};
