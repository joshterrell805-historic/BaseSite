module.exports = Doc;

var debug = require('debug')('basesite:lib:Content:Doc'),
    assert = require('assert');


/**
 * Return a promise for a doc.
 * @resolve null if not exists, else a doc.
 */
function Doc(options) {
  // fields
  this.id;
  this.publish_ts;
  this.edit_ts;
  this.title;
  this.body;
  this.doctype;
  this.private;

  this.options_ = options;

  if (options.pathname !== undefined) {
    this.title = this.pathnameToTitle(options.pathname);
  } else if (options.title !== undefined) {
    this.title = options.title;
  } else {
    var e = new Error('title or pathname must be defined in options');
    e.code = 'MISSING_FIELD';
    throw e;
  }

  return this.find_();
}

/**
 * Return the title of an entry given the `pathname` requested by the user.
 *
 * @param the `pathname` of the request. EG "/articles/How To Tile A Shoe"
 *
 * @return the title of the Entry.
 */
Doc.prototype.pathnameToTitle = function pathnameToTile(pathname) {
  var index = pathname.lastIndexOf('/');
  var title = pathname.substr(index + 1);
  var title = decodeURI(title);
  return title;
};

/**
 * Does the doc exist?
 * @resolve boolean
 */
Doc.prototype.find_ = function find_() {
  return mysqlQuery('SELECT '
      + 'id, publish_ts, edit_ts, title, body, doctype, private '
      + 'FROM docs WHERE title = ?', this.title)
  .then(function(results) {
    if (results.length === 0)
      return null;
    assert.strictEqual(results.length, 1)
    var row = results[0];
    this.id = row.id;
    this.publish_ts = row.publish_ts;
    this.edit_ts = row.edit_ts;
    this.body = row.body;
    this.doctype = row.doctype;
    this.private = row.private;
    return this;
  }.bind(this));
};
