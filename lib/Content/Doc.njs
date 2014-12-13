module.exports = Doc;

var debug = require('debug')('basesite:lib:Content:Doc'),
    assert = require('assert'),
    md5 = require('blueimp-md5').md5;

function Doc(options) {
  this.id;
  this.publish_ts;
  this.edit_ts;
  this.title;
  this.body;
  this.category;
  this.private;
  this.hash;
  this.makeHash = Doc.prototype.makeHash;
}

Doc.prototype.makeHash = function makeHash() {
  // TODO why the fuck and I using JS on the backend if I can't use this without
  // copy+pasta?
  return md5(this.title + this.body + (this.category?this.category:'NULL') +
      (this.private?'TRUE':'FALSE'))
};

Doc.prototype.getRenderContext = function() {
  return renderMarkdown(this.body)
  .then(function(markdown) {
    return {
      title: this.title,
      body: markdown,
      publish_ts: this.publish_ts.getTime() / 1000,
      edit_ts: this.publish_ts == this.edit_ts ? false :
          this.edit_ts.getTime() / 1000,
      category: this.category,
    }
  }.bind(this));
}

Doc.prototype.toString = function toString() {
  return JSON.stringify(this);
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
      + 'id, publish_ts, edit_ts, title, body, category, private, title, hash '
      + 'FROM docs '
      + 'WHERE id = ? ', [id])
  .then(Doc.parseResults_);
};
Doc.findByTitle = function findByTitle(title) {
  return mysqlQuery('SELECT '
      + 'id, publish_ts, edit_ts, title, body, category, private, title, hash '
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
  doc.category = row.category;
  doc.private = row.private;
  doc.title = row.title;
  doc.hash = row.hash;

  return doc;
};

/**
 * Update the corresponding doc (passed by client).
 */
Doc.update = function update(doc) {
  if (Doc.prototype.makeHash.call(doc) != doc.hash) {
    return Promise.reject(new Error('Invalid hash'));
  }
  if (doc.hash === doc.old_hash) {
    return Promise.reject(new Error('Identical hash (unchanged doc)'));
  }

  debug(doc.id);debug(doc.old_hash);
  return mysqlQuery('UPDATE docs SET '
      + 'title=?, body=?, category=?, private=?, hash=? '
      + 'WHERE id=? AND hash=?',
      [doc.title, doc.body, doc.category, doc.private, doc.hash, doc.id,
          doc.old_hash])
  .then(function(results) {
    debug(results);
    if (results.affectedRows == 0) {
      throw new Error('can\'t find matching doc');
    }
    doc.edit_ts = new Date();
  });
};

Doc.getIndex = function getIndex(session) {
  return mysqlQuery('SELECT title, edit_ts FROM docs ' +
      (session?'':'WHERE private=0 ') + 'ORDER BY edit_ts DESC')
  .then(function (results) {
    return results.map(function(result) {
      return {
        title: result.title,
        url: '/doc/' + result.title,
        timestamp: result.edit_ts.getTime() / 1000,
      };
    });
  });
};

Doc.create = function create() {
  var title = md5(Date.now() + Math.random());
  var doc = {
    title: title,
    body: '',
    category: null,
    private: 1,
  };
  return mysqlQuery('INSERT INTO docs (title, hash) VALUES (?, ?)',
      [title, Doc.prototype.makeHash.call(doc)])
  .then(function (results) {
    if (results.affectedRows !== 1)
      throw new Error('\'da fuck?');
    return Doc.findByTitle(title);
  });
};

Doc.delete = function deleteDoc(id) {
  return mysqlQuery('DELETE FROM docs WHERE id=?', [id])
  .then(function(results) {
    if (results.affectedRows !== 1)
      throw new Error('\'da fuck?');
  });
}
