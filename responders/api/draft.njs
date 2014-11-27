module.exports = Responder;

var Draft = lib('Content/Draft'),
    debug = require('debug')('basesite:responder:api/draft');

function Responder() {
   ApiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(ApiResponder.prototype);

Responder.prototype.methods = {
  /** TODO **/
  'GET': function* GET(cont) {
    var obj;
    if (!this.session) {
      this.responseCode = 401;
      obj = '';
    } else {
      this.responseCode = 304;
      this.query.hash;
      obj = ''
    }

    this.reply(obj);
  },
  /** update a draft..creating is gui request. **/
  'POST': function* POST(cont) {
    this.validateCsrf();

    if (!this.session) {
      this.setResponseCode('401');
      return JSON.stringify({
        success: false,
        code: 'UNAUTHORIZED',
      });
    }

    try {
      // TODO don't bother reading post data if not logged in.
      var draft = JSON.parse(this.req.body);
      debug(draft);
    } catch(e) {
      debug('invalid json: %s', this.req.body);
      this.setResponseCode('400');
      return JSON.stringify({
        success: false,
        code: 'INVALID_JSON',
      });
    }

    try {
      yield cont.p(Draft.update(draft));
      return JSON.stringify({success: true});
    } catch (e) {
      debug(e);
      this.setResponseCode('400');
      return JSON.stringify({
        success: false,
        message: 'INVALID_DRAFT'
      });
    }
  }
};
