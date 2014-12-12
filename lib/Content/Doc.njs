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

//title body doctype
Doc.update = function update(id, data) {
  return mysqlQuery('UPDATE docs SET title=?, body=? where id=?',
      [data.title, data.body, id])
  .then(function(results) {
    if (results.affectedRows !== 1)
      throw new Error('Draft not found.');
    return Doc.find(id);
  });
};
Doc.create = function create(data) {
  debug(data);
  return mysqlQuery('INSERT INTO docs (title, body, doctype) VALUES (?, ?, ?)',
      [data.title, data.body, data.doctype])
  .then(function (results) {
    if (results.affectedRows !== 1)
      throw new Error('\'da fuck?');
    return Doc.findByTitle(data.title);
  });
};
