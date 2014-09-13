module.exports = Article;

var Entry = lib('Content/Entry');

function Article() {
   Entry.apply(this, arguments);
}

Article.prototype = Object.create(Entry.prototype);

Article.prototype.contentRoot = site.config.contentRoot + '/articles';

Article.prototype.definedFields = {
   'body':        'body.markdown',
   'meta':        'meta.json',
   'description': 'description.markdown',
};

/**
 * @return: promise for array of hash {title, description}
 */
Article.getFeaturedArticles = function getFeaturedArticles() {
   return readFile(site.config.contentRoot + '/featuredArticles.json')
   .then(JSON.parse)
   .then(function(titles) {
      // array of promises for hash {title, description}
      var featuredArticlePs = titles.map(function(title) {
         var article = new Article({title: title});
         var descriptionP = article.getField('description')
         .then(renderMarkdown);

         return descriptionP.then(function(description) {
            return {
               title: title,
               description: description,
            };
         });
      });

      return Promise.all(featuredArticlePs);
   });
};
