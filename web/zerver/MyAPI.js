var feedparser = require('../../node_modules/feedparser');

var feedCache = {};
exports.loadFeed = function (url, callback) {
	var cache = feedCache[url];
	var fifteenMinutes = 15*60*1000;
	if (cache && cache.time > Date.now() - fifteenMinutes) {
		callback(cache.meta, cache.articles);
		return;
	}

	feedparser.parseUrl(url).on('complete', done);

	function done(meta, articles) {
		feedCache[url] = {
			time: Date.now(),
			meta: meta,
			articles: articles,
		};
		callback(meta, articles);
	}
}

