module.exports = BaseResponder;

var jugglypuff = require('jugglypuff'),
    debug = require('debug')('basesite:BaseResponder');

function BaseResponder() {
   jugglypuff.Responder.apply(this, arguments);
}

BaseResponder.prototype = Object.create(jugglypuff.Responder.prototype);

BaseResponder.prototype.modulePathToPageName =
 function modulePathToPageName(_filename) {
   // is this a base responder or site responder?
   if (_filename.startsWith(site._baseConfig.responderRoot)) {
      var responderRoot = site._baseConfig.responderRoot;
      var responderExtension = '.njs';
   } else {
      var responderRoot = site.config.responderRoot;
      var responderExtension = site.config.responderExtension;
   }

   var pageName = _filename.substr(0, _filename.length -
    responderExtension.length);
   pageName = pageName.substr(responderRoot.length) + 'Page';
   debug('convert module to page: %s -> %s', _filename, pageName);
   return pageName;
};

// @override
BaseResponder.prototype.onUnhandledMethodError =
 function onUnHandledMethodError(err) {
   var debug = require('debug')('basesite:unhandledMethodError');
   debug(err);
   this.res.writeHead('500');
   var message = site.config.isProduction ?
    '500: Unexpected Server Error' : err.toString();
   this.res.end(message);
};
