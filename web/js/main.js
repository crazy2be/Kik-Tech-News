var feeds = [
	'verge',
	'engadget',
];
var feedTitles = [
	'The Verge',
	'Engadget',
];
App.populator('articleList', function (page, data) {
	var feedNum = +data.feed || 0;

	changeMainTitle(feedNum);

	var wrapper = page.querySelector('.wrapper');
	var slideviewer = new PhotoViewer._SlideViewer(wrapper, source, {
		startAt: feedNum,
		length: 2,
	});

	page.addEventListener('appLayout', function () {
		slideviewer.refreshSize();
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

		MyAPI.loadFeed(feed, function (meta, articles) {
			populateArticleList(articles, list, feed);
		});

		return list;
	}

	function populateArticleList(articles, list, feed) {
		articles.forEach(function (item) {
			var row = $('<div />').addClass('app-button');
			row.text(item.title);
			row.clickable().on('click', function () {
				var data = {
					item: item,
					feed: feeds.indexOf(feed),
				}
				App.load('articleView', data);
			});
			list.append(row);
		});
		list.css('height', '100%');
		list.scrollable();
	}

	function changeMainTitle(slideNum) {
// 		if (App.platform == 'android' && slideviewer) {
// 			slideviewer.disable3d();
// 		}
		$(page).find('#titleMainPage').text(feedTitles[slideNum]);
	}

	var refreshPage = $(page).find('#titleMainPage');
	refreshPage.clickable().on('click', function () {
		if (refreshPage.text() == 'Engadget') {
			var passObj = {
				'list': 'engadget'
			};
			App.load('articleList', passObj, 'fade');
		} else if (refreshPage.text() == 'The Verge') {
			var passObj = {
				'list': 'verge'
			};
			App.load('articleList', passObj, 'fade');
		}
	});
});

App.populator('articleView', function (page, data) {
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

if (cards.browser && cards.browser.linkData) {
	// Card was launched by a conversation
	App.load('articleView', cards.browser.linkData);
} else {
	App.load('articleList', 'verge');
}
