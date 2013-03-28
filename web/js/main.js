var feeds = [
	{
		id: 'verge',
		name: 'The Verge',
		url: 'http://www.theverge.com/rss/index.xml',
	},{
		id: 'engadget',
		name: 'Engadget',
		url: 'http://www.engadget.com/rss.xml',
	},
];
App.populator('list', function (page, data) {
	var feedNum = +data.feed || 0;
	var wrapper = page.querySelector('.wrapper');
	var slideviewer = new PhotoViewer._SlideViewer(wrapper, source, {
		startAt: feedNum,
		length: 2,
	});

	page.addEventListener('appLayout', function () {
		slideviewer.refreshSize();
	});

	updateTitle(feedNum);
	slideviewer.on('flip', function (feedNum) {
		updateTitle(feedNum);
	});

	// Android hates having too much 3d, and will break our clicks in
	// vengence. This is a hacky workaround.
// 	if (App.platform == 'android') {
// 		slideviewer.disable3d();
// 		slideviewer.on('move', function () {
// 			slideviewer.enable3d();
// 		});
// 	}

	function source(i) {
		var feed = feeds[i];
		if (!feed) return;

		var list = $('<ul />').addClass('app-list');
		list.html('Loading...');
		MyAPI.loadFeed(feed.url, function (meta, articles) {
			populateArticleList(articles, list, i);
		});

		return list;
	}

	function populateArticleList(articles, list, feedNum) {
		list.html('');
		articles.forEach(function (article) {
			var row = $('<li />').addClass('app-button');
			var title = $('<div />').addClass('title');
			title.text(article.title);
			row.clickable().on('click', function () {
				var data = {
					article: article,
					feed: feedNum,
				}
				App.load('content', data);
			});
			row.append(title);
			list.append(row);
		});
		list.css('height', '100%');
		list.scrollable();
	}

	function updateTitle(feedNum) {
		var title = page.querySelector('.app-title');
		title.innerHTML = feeds[feedNum].name;
	}
});

App.populator('content', function (page, data) {
	var article = data.article;

	var temp = $('<div />').html(article.description);
	var image = temp.find('img');
	var imageUrl = getThumbnailURL(image.attr('src'), 0, window.innerWidth, 1);
	var description = temp.text().replace('Continue reading', '').replace('…', '');

	$(page).find('.title').html(article.title);
	$(page).find('.image').attr('src', imageUrl);
	$(page).find('.content').html(description);
	$(page).find('#kikMe').on('click', function () {
		cards.kik.send({
			title: article.title,
			text: description,
			pic: image.attr('src'),
			big: false,
			linkData: JSON.stringify(data),
		});
	});
	$(page).find('#continue').on('click', function () {
		var url = article['link'];
		var open = cards.browser && cards.browser.open || window.open;
		open(url);
	});
	if (cards.browser && cards.browser.linkData) {
		$(page).find('#home').on('click', function () {
			App.load('list', {feed: data.feed});
			cards.browser.linkData = '';
		});
	}
});

if (!window.cards) window.cards = {};
if (cards.browser && cards.browser.linkData) {
	// Card was launched by a conversation
	App.load('content', cards.browser.linkData);
} else {
	App.load('list');
}

/*
 *   url     = URL of image (must contain a hostname)
 *   height  = desired height of thumbnail in pixels
 *   width   = desired width of thumbnail in pixels
 *   quality = desired quality of thumbnail (values are 0 to 2)
 *
 *   If only one dimension is specified, aspect ratio will be preserved
 *   and the thumbnail will be a scaled version of the original.
 *   If both dimensions are specified, the image will be scaled and
 *   cropped to the desired dimensions.
 */
function getThumbnailURL (url, height, width, quality) {
	if (!height && !width) {
		throw 'height and/or width must be specified';
	}

	var BASE_URL = 'http://cards-thumbnailer.appspot.com/';
	var thumbURL = BASE_URL;

	thumbURL += encodeURIComponent(url) + '?';

	thumbURL += 'h=' + (height  || '') + '&';
	thumbURL += 'w=' + (width   || '') + '&';
	thumbURL += 'q=' + (quality || 0 );

	return thumbURL;
}
