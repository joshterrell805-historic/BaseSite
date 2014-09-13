module.exports = Entry;

var fs = require('fs'),
    debug = require('debug')('basesite:lib:Content:Entry');

function Entry(options) {
   this.options = options;

   if (options.pathname !== undefined) {
      this.title = this.pathnameToTitle(options.pathname);
   } else if (options.title !== undefined) {
      this.title = options.title;
   } else {
      var e = new Error('title or pathname must be defined in options');
      e.code = 'MISSING_FIELD';
      throw e;
   }

   this._Entry_fields = {};
   debug('new Entry %o', this.title);
}

/**
 * Return the title of an entry given the `pathname` requested by the user.
 *
 * @param the `pathname` of the request. EG "/articles/How To Tile A Shoe"
 *
 * @return the title of the Entry.
 */
Entry.prototype.pathnameToTitle = function pathnameToTile(pathname) {
   var index = pathname.lastIndexOf('/');
   var title = pathname.substr(index + 1);
   var title = decodeURI(title);
   return title;
};

/**
 * Does the entry exist?
 *
 * @return: promise for boolean
 */
Entry.prototype.exists = function exists() {
   var pathname = this.contentRoot + '/' + this.title;

   return fs_stat(pathname).then(function(stats) {
      return this.title !== undefined
          && this.title !== ''
          && !this.title.startsWith('.')
          && stats.isDirectory();
   }.bind(this),
   function(err) {
      if (err.code === 'ENOENT') {
         return false;
      }
      throw err;
   });
};

/**
 * NOTE:
 * each subclass should define its fields here.
 * EG: {
 *    'body': 'body.markdown',
 *    'meta': 'meta.json',
 * }
 */
Entry.prototype.definedFields = {};

/**
 * Get the field of the entry identified by `field`.
 *
 * @return: a promise for the contents of the field
 */
Entry.prototype.getField = function getField(field) {
   var contents = this._Entry_fields[field];
   if (contents !== undefined) {
      return Promise.resolve(contents);
   }

   var contentsP = this.readField(field);
   return contentsP.then(function(contents) {
      return this._Entry_fields[field] = contents;
   }.bind(this));
};

/**
 * Get a promise for the contents of the field as a string.
 * EG: this.get('body')
 *
 * NOTE: reads the file every time. For a cached version of this, check
 *  out `#getField`.
 *
 * NOTE: field must be defined in this.definedFields;
 *
 * @param the name of the field to read from disk.
 * @return a promise for the contents of the field.
 */
Entry.prototype.readField = function readField(field) {
   var filename = this.definedFields[field];
   var pathname = this.contentRoot + '/' + this.title + '/' + filename;

   if (filename === undefined) {
      var e = new Error(field + ' is not defined in this.fieldtoFilename');
      e.code = 'MISSING_FIELD';
      return Promise.reject(e);
   }

   return readFile(pathname);
};


/**
 * NOTE:
 * Sub classes must set this to the appropriate content root from the config.
 * The path should be absolute with no trailing slash.
 */
Entry.prototype.contentRoot = null;
