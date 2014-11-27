module.exports = ApiResponder;

var BaseResponder = require('./BaseResponder.njs'),
    debug = require('debug')('basesite:ApiResponder');

function ApiResponder() {
   BaseResponder.apply(this, arguments);
}

ApiResponder.prototype = Object.create(BaseResponder.prototype);
