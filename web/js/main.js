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
		var list = $('<ul />').addClass('app-list');
		var feed = feeds[i];
		if (!feed) return;

		MyAPI.loadFeed(feed.url, function (meta, articles) {
			populateArticleList(articles, list, i);
		});

		return list;
	}

	function populateArticleList(articles, list, feedNum) {
		articles.forEach(function (item) {
			var row = $('<div />').addClass('app-button');
			row.text(item.title);
			row.clickable().on('click', function () {
				var data = {
					item: item,
					feed: feedNum,
				}
				App.load('content', data);
			});
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
	var item = data['item'];
	var list = data['list'];

	var continueButton = $(page).find('#continue');
	var articleTitle = item['title'];
	var articleDescription = item['description'];
	var articleLink = item['link'];
	var articleAuthor = item['author'];

	var sectionTitle = $('<div />').addClass('app-section');
	var secttionArticle = $('<div />').addClass('app-section');
	var secttionImage = $('<div />').addClass('app-section');

	var temp = $('<div />').html(articleDescription);
	var image = temp.find('img');
	var description = temp.text().replace('Continue reading', '').replace('…', '');
	var descriptionWithTag = $('<p />');
	descriptionWithTag.text(description);

	var title = $('<h4 />');
	var author = $('<footer />');
	$(page).find('.articleview').append(sectionTitle);
	sectionTitle.append(title);
	$(page).find('.articleview').append(secttionImage);
	secttionImage.append(image);
	$(page).find('.articleview').append(secttionArticle);

	secttionArticle.append(descriptionWithTag);
	secttionArticle.append(author);

	title.text(articleTitle);
	author.text(articleAuthor);

	$(page).find('#kikMe').on('click', function () {
		var x = JSON.stringify(data);
		var url = image.attr('src');
		cards.kik.send({
			title: title.text(),
			text: 'Check This Out!!',
			pic: url,
			big: false,
			linkData: x,
		});
	});

	continueButton.on('click', function () {
		cards.browser.open(item['link']);
	});

	if (cards.browser && cards.browser.linkData) {
		// Card was launched by a conversation
		$(page).find('#originalHome').replaceWith('<div class ="app-button left" id="home">Home</div>');
		var homeButton = $(page).find('#home');
		var listObj = {
			'list': list
		};
		homeButton.on('click', function () {
			App.load('articleList', listObj, 'scale-out')
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
