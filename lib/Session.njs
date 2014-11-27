module.exports = Session;

var User = lib('User'),
    google = require('googleapis'),
    Promise = require('promise'),
    md5 = require('md5').md5,
    credentials = lib('.credentials'),
    debug = require('debug')('BaseSite:Session'),
    assert = require('assert');;

var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var scopes = ['https://www.googleapis.com/auth/userinfo.email'];
var oauth2Client = new OAuth2(
    credentials.googleOauth2.clientId,
    credentials.googleOauth2.clientSecret,
    credentials.googleOauth2.redirectUri);

function Session() {
  // the sessionId
  this.id = null;
  // the corresponding User object
  this.user = null;
  // true if this session was created in this request
  this.created = null;
  // if this request is a result of the user attempting to login,
  // redirectUrl is the url that the visitor came from.
  this.redirectUrl = null;
  // true if this session is expired
  this.expired = null;
}

Session.csrf = function csrf() {
  return md5(Math.random());
};

Session.generateOauthUrl = function generateOauthUrl(url, csrf) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes,
    state: JSON.stringify({
      csrf: csrf,
      redirectUrl: url,
    })
  });

  return url;
};

Session.generateId = function generateId() {
  return md5(Math.random());
};

/**
 * Read the request to determine whether it has an active associated session.
 *
 * The returned session object is either null (no session) or not null
 *   (session).
 *
 * If this.expired is set, the session has expired.
 *
 * @resolve a session object or null
 */
Session.parseRequest = function parseRequest(cookies) {
  return new Promise(function(resolve, reject) {
    if (cookies.sessionId) {
      resolve(Session.restore_(cookies.sessionId));
    } else {
      resolve(null);
    }
  });
};

/**
 * Attempt to login using the authcode
 */
Session.login = function login(code, state, cookieCsrf) {
  return new Promise(function(resolve, reject) {
    try {
      state = state && JSON.parse(state);
    } catch (e) {
      reject(new CodedError('INVALID_JSON', 'Invalid state Json'));
    }

    if (!code || !state) {
      reject(new CodedError('MISSING_FIELD',
          'missing code or state query parameters'));
    }

    // This is the only place where the csrf comes from a query parameter.
    if (!(state && state.csrf && state.csrf === cookieCsrf)) {
      reject(new CodedError('INVALID_CSRF', 'Invalid Csrf Token'));
    }

    oauth2Client.getToken(code, function(err, tokens) {
      if (err)
        reject(err);
      else {
        oauth2Client.setCredentials({access_token: tokens.access_token});
        plus.people.get({ userId: 'me', auth: oauth2Client },
            function(err, response) {
          if (err)
            reject(err);
          else {
            var emails = response.emails.map(function(val) {
              return val.value;
            });
            resolve(Session.create_(emails, state.redirectUrl));
          }
        });
      }
    });

  });
};

/**
 * Create a new session
 */
Session.create_ = function create_(emails, redirectUrl) {
  var sessionId = Session.generateId();
  return User.findByEmails(emails)
  .then(function(user) {
    if (!user) {
      var session = new Session();
      session.id = false;
      session.redirectUrl = redirectUrl;
      return session;
    }
    return mysqlQuery('INSERT INTO sessions (user_id, id) VALUES (?, ?)',
        [user.id, sessionId])
    .then(function() {
      var session = new Session();
      session.id = sessionId;
      session.created = true;
      session.redirectUrl = redirectUrl;
      session.expired = false;
      session.user = user;
      return session;
    });
  });
};

/**
 * Restore a session from the database.
 *
 * If expired, return session with this.expired.
 * (note, this could be a false session all together, either way delete
 * the cookie).
 */
Session.restore_ = function restore_(sessionId) {
  return mysqlQuery('SELECT user_id FROM sessions WHERE id = ? ' +
      'AND UNIX_TIMESTAMP() < UNIX_TIMESTAMP(last_active_ts) + ?',
      [sessionId, site.config.sessionDuration])
  .then(function(results) {
    if (results.length == 1) {
      var updateSessionTs_p = mysqlQuery('UPDATE sessions SET ' +
          'last_active_ts = CURRENT_TIMESTAMP WHERE id = ?',
          [sessionId]);
      var user_p = User.find(results[0].user_id);
      return Promise.all([updateSessionTs_p, user_p])
      .then(function(resolved) {
        var user = resolved[1];
        assert(!!user);
        var session = new Session();
        session.id = sessionId;
        session.user = user;
        session.created = false;
        session.expired = false;
        return session;
      });
    } else {
      // TODO expired sessions should get removed from the database peroidically
      // write a cron task
      var session = new Session();
      session.id = sessionId;
      session.created = false;
      session.expired = true;
      return session;
    }
  });
}
