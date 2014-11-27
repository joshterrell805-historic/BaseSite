module.exports = ApiResponder;

var BaseResponder = require('./BaseResponder.njs'),
    debug = require('debug')('basesite:ApiResponder');

function ApiResponder() {
   BaseResponder.apply(this, arguments);
}

ApiResponder.prototype = Object.create(BaseResponder.prototype);

ApiResponder.prototype.reply = function reply(obj) {
  // TODO do this everywhere.. the writeHead and headers is error prone
  // spread out through all the responders. This should all happen in one
  // spot. Need to define headers object and merge headers too.
  var text = JSON.stringify(obj);
  this.res.writeHead(this.responseCode || 200);
  this.res.end(text);
};
