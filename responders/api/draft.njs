module.exports = Responder;

var Draft = lib('Content/Draft'),
    debug = require('debug')('basesite:responder:api/draft');

function Responder() {
   ApiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(ApiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET(cont, res) {
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
  'POST': function* POST(cont, res) {
    if (!this.session) {
      this.responseCode = 401;
      return this.reply({
        success: false,
        code: 'UNAUTHORIZED',
      });
    }

    try {
      // TODO don't bother reading post data if not logged in.
      var draft = JSON.parse(this.body);
      debug(draft);
    } catch(e) {
      debug('invalid json: %s', this.body);
      this.responseCode = 400;
      return this.reply({
        success: false,
        code: 'INVALID_JSON',
      });
    }

    try {
      yield cont.p(Draft.update(draft));
      return this.reply({success: true});
    } catch (e) {
      debug(e);
      this.responseCode = 400;
      return this.reply({
        success: false,
        message: 'INVALID_DRAFT'
      });
    }
  }
};
