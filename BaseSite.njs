module.exports = BaseSite;

/**
 * The base website framework for all my websites 
 */
function BaseSite() {
   this._baseRoot = __dirname;
   this._baseConfig = {
      libRoot: this._baseRoot + '/lib',
      templateHelperRoot: this._baseRoot + '/helpers',
      templateRoot: this._baseRoot + '/partials',
      responderRoot: this._baseRoot + '/responders',
   };
}

/**
 * Setup the server if it hasn't been setup already, then start listening for
 *  connections.
 *
 * Return a promise that resolves when the site has started successfully.
 */
BaseSite.prototype.start = function start() {
   // happens before globals are set.
   var Promise = require('promise');

   var setupP = this.hasSetup ? Promise.resolve() : this.setup();

   var returnP = setupP.then(this._start.bind(this));
   returnP.done();
   return returnP;
};

/**
 * Return a promise that resolves when all setup work has completed.
 */
BaseSite.prototype.setup = function registerHelpers() {
   // happens before globals are set.
   var Promise = require('promise');

   this.hasSetup = true;
   return Promise.resolve()
   .then(this.firstSetup.bind(this))
   .then(this.getConfigs.bind(this))
   .then(this.setConfig.bind(this))
   .then(this.setupGlobals.bind(this))
   .then(this.registerHelpers.bind(this))
   .then(this.registerPartials.bind(this))
   .then(this.lastSetup.bind(this));
};

BaseSite.defaultConfig = {
   isProduction: true,
   title: 'My website',
   hostname: '127.0.0.1',
   port: -1,
   DEBUG: '*',
   contentRoot: process.env.PWD + '/content',
   templateRoot: process.env.PWD + '/partials',
   libRoot: process.env.PWD + '/lib',
   templateHelperRoot: process.env.PWD + '/helpers',
   responderRoot: process.env.PWD + '/responders',
   documentRoot: process.env.PWD + '/public',
   responderExtension: '.njs',
   // Time in seconds a session can be inactive for before the session expires.
   // Session last_active time is updated every time user makes a request.
   sessionDuration: 24 * 60 * 60,
};

/**
 * Sites must implement!
 *
 * Return a promise for a hash of configs:
 *
 * multiple:
 *    'absolute path to site root without trailing /' : config object
 * single:
 *    'default' : config object
 */
BaseSite.prototype.getConfigs = function getConfigs() {
   // happens before globals are set.
   var Promise = require('promise');

   return Promise.resolve({});
};

BaseSite.prototype.setConfig = function setConfig(configs) {
   // happens before globals are set.
   var Promise = require('promise');
   var _ = require('underscore');

   var config = configs[process.env.PWD];

   if (config === undefined) {
      var e = new Error('unknown document root ' + process.env.PWD);
      e.code = 'NOT_FOUND';
      throw e;
   }

   config = _.defaults({}, config, configs['default'], BaseSite.defaultConfig);
   process.env.DEBUG = config.DEBUG;

   this.config = config;

   return Promise.resolve();
};


/**
 * Return a promise that resolves when the handlebars helpers have been
 *  registered.
 */
BaseSite.prototype.registerHelpers = function registerHelpers() {
   return require('./registerHelpers.njs')();
};

/**
 * Return a promise that resolves when the handlebars partials (templates) have
 *  been registered.
 */
BaseSite.prototype.registerPartials = function registerPartials() {
   return require('./registerPartials.njs')();
};

/**
 * Return a promise that resolves when the globals have been successfully
 *  initialized for the site.
 */
BaseSite.prototype.setupGlobals = function setupGlobals() {
   global.site = this;
   global._ = require('underscore');
   global.Promise = require('promise');
   global.handlebars = require('handlebars');
   global.lib = require('./lib.njs');
   global.marked = require('marked');
   global.fs = require('fs');
   global.assert = require('assert');
   global.BaseResponder = require('./BaseResponder.njs');
   global.GuiResponder = require('./GuiResponder.njs');
   require('ExtendableError');
   //TODO
   // global.AjaxResponder = require('./AjaxResponder.njs');
   // global.ApiResponder = require('./ApiResponder.njs');

   global.readFile = function define_readFile() {
     var read = Promise.denodeify(fs.readFile);
     return function readFile(pathname) {
        return read(pathname, 'utf8');
     };
   }();
   global.fs_stat = Promise.denodeify(fs.stat);
   global.fs_readdir = Promise.denodeify(fs.readdir);

   global.renderMarkdown = Promise.denodeify(marked);

   global.requireBaseResponder = this.requireBaseResponder.bind(this);

   var mysqlConnection = null;
   var query = null;
   Object.defineProperty(global, 'mysqlConn', {
     'get': function getMysqlConnection() {
        if (!mysqlConnection) {
          createConnection();
        }
        return mysqlConnection;
     }
   });
   Object.defineProperty(global, 'mysqlQuery', {
    'get': function getQuery() {
       if (!mysqlConnection) {
         createConnection();
       }
       return query;
    }
   });
   var mysql = require('mysql'); // TODO abstract me
   var credentials = lib('.credentials');
   var reconnects = 0;
   var maxRecconnects = 5;
   function setConnection(conn) {
      mysqlConection = conn;
      query = Promise.denodeify(conn.query.bind(conn));
   }
   function createConnection() {
      connection = mysql.createConnection(credentials.mysql);
      connection.on('error', function onConnectionError(err) {
         if (err) {
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
               if (reconnects < maxRecconnects) {
                  ++reconnects;
                  createConnection();
               } else {
                  console.error('Max mysql reconnects exceeded.');
                  throw err;
               }
            } else {
               throw err;
            }
         } else {
            reconnects = 0;
         }
      });
      connection.connect();
      setConnection(connection);
   }
   this.onStop(function() {
     if (mysqlConnection) {
       mysqlConnection.destroy();
     }
   });

   return Promise.resolve();
};

BaseSite.prototype.onStop = function onStop(func) {
  if (!this.onStopFuncs_) {
    this.onStopFuncs_ = [];
  }
  this.onStopFuncs_.push(func);
};

/**
 * For sites that need to do some extra setup stuff before everything else.
 */
BaseSite.prototype.firstSetup = function firstSetup() {
   // happens before globals are set.
   var Promise = require('promise');

   return Promise.resolve();
};

/**
 * For sites that need to do some extra setup stuff after everything else.
 */
BaseSite.prototype.lastSetup = function lastSetup() {
   return Promise.resolve();
};

/**
 * requireBaseResponder returns a responder module from ./responders/
 *
 * This is useful if, say, one site needs to do some special work for the
 *  Posts responder.. it can requireBaseResponder('Posts/_') and then subclass
 *  it.
 */
BaseSite.prototype.requireBaseResponder = function requireBaseResponder(name) {
   return require(this._baseConfig.responderRoot + '/' + name + '.njs');
};

/**
 * Actually start the server after things have been configured.
 */
BaseSite.prototype._start = function _start() {
   var jugglypuff = require('jugglypuff');
   var options = _.pick(this.config, 'hostname', 'port', 'responderRoot');
   this.server = new jugglypuff.Server(options);
   this.server.onStop = function() {
      for (var i = 0; this.onStopFuncs_ && i < this.onStopFuncs_.length; ++i) {
        this.onStopFuncs_[i]();
      }
   }.bind(this);
   return this.server.start();
};
