module.exports = lib;

var debug = require('debug')('basesite:lib');

var loadedModules = {
   'base': {},
   'site': {},
};

function lib(name) {
   try {
      var module = lib.site(name);
   } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.endsWith(name + ".njs'")) {
         var module = lib.base(name);
      } else {
         throw e;
      }
   }

   return module;
}

lib.base = function lib_base(name) {
   return load('base', name, site._baseConfig.libRoot);
};

lib.site = function lib_site(name) {
   return load('site', name, site.config.libRoot);
};

function load(type, name, libRoot) {
   var module = loadedModules[type][name];

   if (module === undefined) {
      module = require(libRoot + '/' + name + '.njs');
      debug('loaded (%s) %s', type, name);
      loadedModules[type][name] = module;
   }

   return module;
}
