module.exports = registerPartials;

var debug = require('debug')('basesite:registerPartials');

/**
 * Return a promise that resolves when all partials have been registered.
 */
function registerPartials() {
   var baseTemplatesP = getTemplates(site._baseConfig.templateRoot, '/');
   var siteTemplatesP = getTemplates(site.config.templateRoot, '/');
   return Promise.all([baseTemplatesP, siteTemplatesP])
   .then(function(results) {
      var baseTemplates = results[0];
      var siteTemplates = results[1];

      regPartials('base', baseTemplates);
      regPartials('site', siteTemplates);

      function regPartials(type, partials) {
         var keys = _.keys(partials);

         for (var keyI in keys) {
            var name = keys[keyI];
            debug('found (%s) %s', type, name);
            var template = handlebars.compile(partials[name]);
            handlebars.registerPartial(name, template);
         }
      }
   });

   /**
    * subDir is a sub-directory of config.templateRoot
    * return: promise for hash of
    *    '/partial/name': <partial>
    */
   function getTemplates(root, dir) {
      return fs_readdir(root + dir).then(function(filenames) {
         // array of promises for hash 'partialname': <partial>
         var hashPromises = [];
         filenames.forEach(function (filename) {
            if (filename.startsWith('.')) {
            } else if (filename.endsWith('.hbs')) {
               var path = root + dir + filename;
               var partialPromise = readFile(path).then(function(partial) {
                  var name = dir + filename.substr(0, filename.length - 4);
                  var hash = {};
                  hash[name] = partial;
                  return hash;
               });
               hashPromises.push(partialPromise);
            } else {
               var subDir = dir + filename + '/';
               var partialsPromise = getTemplates(root, subDir);
               hashPromises.push(partialsPromise);
            }
         });

         // combine all the objects and throw an error if we're gonna overwrite
         //  something.
         return Promise.all(hashPromises).then(function(hashes) {
            var combined = {};
            for (var hashI in hashes) {
               var hash = hashes[hashI];
               var keys = _.keys(hash);
               for (var keyI in keys) {
                  var key = keys[keyI];
                  assert.strictEqual(combined[key], undefined,
                   'should not be overwritting partial ' + key);
                  combined[key] = hash[key];
               }
            }
            return combined;
         });
      });
   }
}
