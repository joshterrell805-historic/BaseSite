module.exports = Doc;

var debug = require('debug')('basesite:lib:Content:Doc'),
    assert = require('assert');

function Doc(options) {
  this.id;
  this.publish_ts;
  this.edit_ts;
  this.title;
  this.body;
  this.doctype;
  this.private;
}

/**
 * @resolve the Doc or null.
 */
Doc.find = function find(id) {
  try {
    id = parseInt(id);
  } catch(e) {
    return Promise.resolve(null);
  }

  return mysqlQuery('SELECT '
      + 'id, publish_ts, edit_ts, title, body, doctype, private, title '
      + 'FROM docs '
      + 'WHERE id = ? ', [id])
  .then(Doc.parseResults_);
};
Doc.findByTitle = function findByTitle(title) {
  return mysqlQuery('SELECT '
      + 'id, publish_ts, edit_ts, title, body, doctype, private, title '
      + 'FROM docs '
      + 'WHERE title = ? ', [title])
  .then(Doc.parseResults_);
};

/**
 * Return the title of a doc given the `pathname` requested by the user.
 *
 * @param the `pathname` of the request.
 *    Must be .../<title>
 *
 * @return the title of the Doc.
 */
Doc.pathnameToTitle = function pathnameToTile(pathname) {
  var index = pathname.lastIndexOf('/');
  var title = pathname.substr(index + 1);
  return decodeURI(title);
};

/**
 * Return the id of an entry given the `pathname` requested by the user.
 *
 * @param the `pathname` of the request.
 *    Must be .../<id>
 *
 * @return the id of the Doc.
 */
Doc.pathnameToId = function pathnameToId (pathname) {
  var index = pathname.lastIndexOf('/');
  var id = pathname.substr(index + 1);
  return decodeURI(id);
};

/**
 * Does the doc exist?
 * @resolve boolean
 */
Doc.parseResults_ = function parseResults_(results) {
  if (results.length === 0)
    return null;

  assert.strictEqual(results.length, 1)
  var row = results[0];
  var doc = new Doc();

  doc.id = row.id;
  doc.publish_ts = row.publish_ts;
  doc.edit_ts = row.edit_ts;
  doc.body = row.body;
  doc.doctype = row.doctype;
  doc.private = row.private;
  doc.title = row.title;

  return doc;
};
