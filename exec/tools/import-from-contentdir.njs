var mysql = require('mysql'),
    Promise = require('promise'),
    fs = require('fs');

console.log(process.argv);

var credentials = require(process.argv[2]);
var connection = mysql.createConnection(credentials.mysql);
connection.connect();
var query = Promise.denodeify(connection.query.bind(connection));

var type = process.argv[3];

var public = 'public' === process.argv[4];

var docs = [];

for (var i = 5; i < process.argv.length; ++i) {
  var markdownPath = process.argv[i] + '/body.markdown';
  var markdown = fs.readFileSync(markdownPath, {encoding: 'utf-8'});
  var metaPath = process.argv[i] + '/meta.json';
  var meta = fs.readFileSync(metaPath, {encoding: 'utf-8'});
  meta = JSON.parse(meta);

  var doc = {};
  var index = process.argv[i].lastIndexOf('/');
  doc.title = index === -1 ? process.argv[i] : process.argv[i].substr(index+1);
  doc.publishTimestamp = parseInt(meta.publishTimestamp);
  doc.lastEditTimestamp = meta.lastEditTimestamp ?
      parseInt(meta.lastEditTimestamp) : doc.publishTimestamp;
  doc.body = markdown;

  docs.push(doc);
}

var vals = docs.reduce(function(prev, cur, i, arr) {
  prev.str += '(?,?,?,?,?,?)' + (i == arr.length-1?'':',');
  prev.arr.push(new Date(cur.publishTimestamp*1000));
  prev.arr.push(new Date(cur.lastEditTimestamp*1000));
  prev.arr.push(cur.title);
  prev.arr.push(cur.body);
  prev.arr.push(type);
  prev.arr.push(!public);
  return prev;
}, {str: '', arr: []});

var q = 'INSERT INTO docs ' +
    '(publish_ts, edit_ts, title, body, doctype, private) ' +
    'VALUES ' + vals.str;
query(q, vals.arr)
.done(function(results) {
  require('assert').equal(results.affectedRows, docs.length);
  connection.end();
});
