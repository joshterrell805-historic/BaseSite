module.exports = Draft;

// TODO global assert
var assert = require('assert'),
    md5 = require('blueimp-md5').md5,
    debug = require('debug')('basesite:lib:Content:Draft'),
    Doc = lib('Content/Doc');

function Draft() {
  this.id = null;
  this.doc_id = null;
  this.edit_ts = null;
  this.title = null;
  this.body = null;
  // md5(title + body + doctype)
  this.hash = null;
  this.doctype = null;
}

/**
 * Update the corresponding draft (passed by client).
 *
 */
Draft.update = function(draft) {
  if (md5(draft.title + draft.body + draft.doctype) != draft.hash) {
    debug('invalid hash');
    return Promise.reject(new Error());
  }
  if (draft.hash === draft.old_hash) {
    debug('identical hash');
    return Promise.reject(new Error());
  }

  return mysqlQuery('UPDATE drafts SET '
      + 'title = ?, body = ?, doctype = ?, hash = ? '
      + 'WHERE id = ? AND hash = ?',
      [draft.title, draft.body, draft.doctype, draft.hash, draft.id,
          draft.old_hash])
  .then(function(results) {
    if (results.affectedRows == 0) {
      debug('can\'t find matching draft');
      throw new Error();
    }
  });
};

/**
 * Submit this draft either creating a new document or updating an existing one.
 */
Draft.prototype.submit = function submit() {
  if (this.doc_id !== null) {
    var docP = Doc.update(this.doc_id, {
      title: this.title,
      body: this.body,
    });
  } else {
    var docP = Doc.create({
      title: this.title,
      body: this.body,
      doctype: this.doctype,
    });
  }

  return docP.then(function(doc) {
    return mysqlQuery('DELETE FROM drafts WHERE id=?', [this.id])
    .then(function (results) {
      if (results.affectedRows !== 1)
        throw new Error('Could not delete draft!');
      return doc;
    });
  }.bind(this));
};

Draft.prototype.toString = function toString() {
  return JSON.stringify(this);
};

Draft.find = function find(id) {
  id = parseInt(id);
  if (isNaN(id))
    return Promise.resolve(null);

  return mysqlQuery('SELECT '
      + 'id, doc_id, edit_ts, title, body, doctype, hash '
      + 'FROM drafts '
      + 'WHERE id = ? ', [id])
  .then(function(results) {
    if (results.length == 0) {
      return null;
    }

    assert.equal(results.length, 1);

    var draft = new Draft();
    var row = results[0];
    draft.id = row.id;
    draft.doc_id = row.doc_id;
    draft.edit_ts = row.edit_ts;
    draft.title = row.title;
    draft.body = row.body;
    draft.hash = row.hash;
    draft.doctype = row.doctype;

    return draft;
  });
};

/**
 * Return the id of a draft given the `pathname` requested by the user.
 *
 * @param the `pathname` of the request.
 *    Must be .../<id>
 *
 * @return the id of the Draft.
 */
Draft.pathnameToId = function pathnameToId(pathname) {
  var index = pathname.lastIndexOf('/');
  var id = pathname.substr(index + 1);
  return decodeURI(id);
};

/**
 * @resolve id of doc
 */
Draft.create = function create(doc) {
  var hash = md5(doc.title + doc.body + doc.doctype);
  return mysqlQuery('INSERT INTO drafts (doc_id, title, body, hash, doctype) ' +
      'VALUES (?, ?, ?, ?, ?)',
      [doc.id, doc.title, doc.body, hash, doc.doctype])
  .then(function(results) {
    assert(results.affectedRows === 1);
    return mysqlQuery('SELECT id FROM drafts WHERE doc_id=?', [doc.id])
    .then(function(results) {
      assert(results.length === 1);
      return results[0].id;
    });
  });
};
