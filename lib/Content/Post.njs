module.exports = Post;

var Entry = lib('Content/Entry');

function Post() {
   Entry.apply(this, arguments);
}

Post.prototype = Object.create(Entry.prototype);

Post.prototype.contentRoot = site.config.contentRoot + '/posts';

Post.prototype.definedFields = {
   'body': 'body.markdown',
   'meta': 'meta.json',
};
