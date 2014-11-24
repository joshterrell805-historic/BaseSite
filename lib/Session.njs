module.exports = Session;

var User = lib('User'),
    google = require('googleapis'),
    Promise = require('promise'),
    csrf = require('csrf')(),
    cookie = require('cookie'),
    credentials = lib('.credentials'),
    debug = require('debug')('BaseSite:Session');

var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var scopes = ['https://www.googleapis.com/auth/userinfo.email'];
var oauth2Client = new OAuth2(
    credentials.googleOauth2.clientId,
    credentials.googleOauth2.clientSecret,
    credentials.googleOauth2.redirectUri);

var csrfSecret = csrf.secretSync();

function Session() {
  // the sessionId
  this.id = null;
  // TODO a User object
  this.user = null;
  // true if this session was created in this request
  this.created = null;
  // true if this session is expired
  this.expired = null;
}

Session.generateOauthUrl = function generateOauthUrl(url) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes,
    state: JSON.stringify({
      csrf: csrf.create(csrfSecret)
    })
  });

  return url;
};

Session.generateId = function generateId() {
  return csrf.create(csrfSecret);
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
Session.login = function login(code, state) {
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

    if (!(state && state.csrf && csrf.verify(csrfSecret, state.csrf))) {
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
            resolve(Session.create_(emails));
          }
        });
      }
    });

  });
};

/**
 * Create a new session
 */
Session.create_ = function create_(emails) {
  var sessionId = Session.generateId();

  return mysqlQuery(
      'INSERT INTO sessions (user_id, id) SELECT users.id, ? ' +
      'FROM users WHERE users.email IN (?) ORDER BY users.id ASC LIMIT 1',
      [sessionId, emails])
  .then(function(results) {
    if (results.affectedRows == 1) {
      // at least one of the emails existed; login is now complete!
      var session = new Session();
      session.id = sessionId;
      session.created = true;
      session.expired = false;
      return session;
    } else if (results.affectedRows == 0) {
      // user id doesn't exist
      var session = new Session();
      session.id = false;
      return session;
    } else {
      throw new Error('Multiple rows inserted for login!');
    }
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
  console.log('restoring: ' + sessionId);
  return mysqlQuery('SELECT count(*) as count FROM sessions WHERE sessions.id = ? ' +
      'AND UNIX_TIMESTAMP() < UNIX_TIMESTAMP(sessions.last_active_ts) + ?',
      [sessionId, site.config.sessionDuration])
  .then(function(results) {
    console.log(results);
    if (results[0].count == 1) {
      return mysqlQuery('UPDATE sessions SET ' +
          'sessions.last_active_ts = CURRENT_TIMESTAMP WHERE sessions.id = ?',
          [sessionId])
      .then(function() {
        var session = new Session();
        session.id = sessionId;
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
