module.exports = Session;

var User = lib('User'),
    google = require('googleapis'),
    Promise = require('promise'),
    csrf = require('csrf'),
    cookie = require('cookie'),
    mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'joshterrell_com'
});
connection.connect();
var query = Promise.denodeify(connection.query.bind(connection));

var OAuth2 = google.auth.OAuth2;
var scopes = ['https://www.googleapis.com/auth/userinfo.email'];
var oauth2Client = new OAuth2(
    "95921165782-lr5jda9p8fq65ps9ofk2qb832e1csfo4.apps.googleusercontent.com",
    "Z3mUI_Om38XFbUZkZeJactsX",
    "redirect uri should get set below");

var csrfSecret = csrf.secretSync();

function Session() {
  // the sessionId
  this.id = null;
  // TODO a User object
  this.user = null;
  // true if this session was created in this request
  this.created = null;
  // if created is true, a url where this request came from and should
  // be redirected to
  this.redirectUrl = null;
  // true if this session is expired
  this.expired = null;
}

Session.generateOauthUrl = function generateOauthUrl(url) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    response_type: 'googleOauthCode',
    scope: scopes,
    state: {
      csrf: csrf.token(csrfSecret + 'csrf'),
      url: url
    }
  });
};

Session.generateId = function generateId() {
  return csrf.token(csrfSecret + 'sesson');
};

/**
 * Read the request to determine whether it has an active associated session.
 *
 * The returned session object may be freshly created (this.created)
 *    or expired (this.expired). If it is created, it will have a url
 *    which the client should be redirected to (this.redirectUrl).
 *
 * @resolve a session object or null
 */
Session.parseRequest = function parseRequest(query, cookies) {
  return new Promise(resolve, reject) {
    if (cookies.sessionId) {
      resolve(Session.restore(cookies.sessionId));
    } else if (query.googleOauthCode) {
      var state = query.state;
      if (!(state && state.csrf && csrf.verify(csrfSecret, state.csrf))) {
        throw new CodedError('INVALID_CSRF', 'Invalid Csrf Token');
      }
      oauth2Client.getToken(query.googleOauthCode, function(err, tokens) {
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
              resolve(Session.create_(emails, tokens.expiry_date / 1000,
                  state.url));
            }
          });
        }
      });
    } else {
      resolve(null);
    }
  };
};

/**
 * Create a new session
 */
Session.create_ = function create_(emails, timestamp, url) {
  var sessionId = Session.generateId();

  return query(
      'INSERT INTO sessions (user_idx, id, expires_ts) SELECT idx, ?, ? ' +
      'FROM users WHERE id IN (?) ORDER BY idx ASC LIMIT 1',
      [sessionId, timestamp, emails])
  .then(function(results) {
    if (results.affectedRows == 1) {
      // at least one of the emails existed; login is now complete!
      var session = new Session();
      session.id = sessionId;
      session.created = true;
      session.redirectUrl = url;
      session.expired = false;
      return session;
    } else if (result.affectedRows == 0) {
      // user id doesn't exist
      return null;
    } else {
      throw new Error('Multiple rows inserted for login!');
    }
  });
};

Session.restore = function restore(sessionId) {
  session.id = sessionId;
  session.created = false;
  session.expired;
}
