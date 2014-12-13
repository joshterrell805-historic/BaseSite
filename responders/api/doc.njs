module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('basesite:responder:api/doc');

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
      var doc = JSON.parse(this.req.body);
      doc.edit_ts = new Date(doc.edit_ts);
      doc.publish_ts = new Date(doc.publish_ts);
      debug(doc);
    } catch(e) {
      debug('invalid json: %s', this.req.body);
      this.setResponseCode('400');
      return JSON.stringify({
        success: false,
        code: 'INVALID_JSON',
      });
    }

    try {
      yield cont.p(Doc.update(doc));
      var context = yield cont.p(Doc.prototype.getRenderContext.call(doc));
      var rendered = handlebars.partials['/doc/doc'](context);
      return JSON.stringify({
        success: true,
        rendered: rendered,
      });
    } catch (e) {
      debug(e);
      this.setResponseCode('400');
      return JSON.stringify({
        success: false,
        message: e.message,
      });
    }
  }
};
