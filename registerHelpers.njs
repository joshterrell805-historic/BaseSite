module.exports = registerHelpers;

var debug = require('debug')('basesite:registerhelpers');

/**
 * Return a promise that resolves when all helpers have been registered.
 *
 * Register partials in base first, then overwrite with those in site.
 */
function registerHelpers() {
   var baseHelpersP = getHelpers(site._baseConfig.templateHelperRoot);
   var siteHelpersP = getHelpers(site.config.templateHelperRoot);

   return Promise.all([baseHelpersP, siteHelpersP])
   .then(function registerDemHelpers(results) {
      var baseHelpers = results[0];
      var siteHelpers = results[1];

      // overwrite base helpers with site helpers.
      regHelpers('base', baseHelpers);
      regHelpers('site', siteHelpers);

      function regHelpers(type, helpers) {
         var keys = _.keys(helpers);

         for (var keyI in keys) {
            var name = keys[keyI];
            debug('found (%s) %s', type, name);
            handlebars.registerHelper(name, helpers[name]);
         }
      }
   });

   /**
    * return: promise for hash of
    *    'helpername': <helper>
    */
   function getHelpers(root) {
      return fs_readdir(root).then(function(filenames) {
         // hash 'helpername': <helper>
         var helpers = [];

         filenames.forEach(function (filename) {
            if (filename.startsWith('.')) {
            } else if (filename.endsWith('.njs')) {
               var path = root + '/' + filename;
               var helper = require(path);
               var name = filename.substring(0, filename.length -
                site.config.responderExtension.length);
               helpers[name] = helper;
            } else {
               var e = new Error('unrecognized filetype ' + path);
               e.code('TYPE_MISMATCH');
               throw e;
            }
         });

         return helpers;
      });
   }
}
