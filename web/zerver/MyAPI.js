var feedparser = require('../../node_modules/feedparser');

var feeds = {
	verge: 'http://www.theverge.com/rss/index.xml',
	engadget: 'http://www.engadget.com/rss.xml',
};
exports.loadFeed = function (name, callback) {
	feedparser.parseUrl(feeds[name]).on('complete',callback);
}

