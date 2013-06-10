/**
	Routers events

	Using:

	urlHandler.hashReader({
		'location/:id 		: function(id) {}, 				// hash contain location str and something after like #location/id798
		'*actions'			: function(actions) {}, 		// matches http://example.com/#anything-here
		'posts/:id' 		: function(id) {}, 				// matches http://example.com/#/posts/121
		'download/*path'	: function(path) {}, 			// matches http://example.com/#/download/user/images/hey.gif
		':route/:action'	: function(route, action) {}	// matches http://example.com/#/dashboard/graph
	});


	API hash reader
	By default hashReader is stoped on init;

	urlHandler.start(); 			//start hashReader
	urlHandler.start(true); 		//start with hold (handler doesn't fire on start, just onpopstate or hashchange)
	urlHandler.stop(); 				//stop hashReader
	urlHandler.triggerHash(str); 	//trigger hashReader stroed hash handler


	Other API

	urlHandler.parseQueryString(); 		//Get data from query string (?data=125&data2=458)
	urlHandler.isHash(); 				//Is hash
	urlHandler.setHash(); 				//Set hash
	urlHandler.getHash(); 				//Get hash
	urlHandler.removeHash(); 			//Remove hash

**/

;(function(window) {
	var version = 0.3.0,
		handlersCollection 	= null,
		namedParam			= /:\w+/g,
		splatParam			= /\*\w+/g,
		escapeRegExp		= /[-[\]{}()+?.,\\^$|#\s]/g,
		isExplorer			= /msie [\w.]+/,
		isHashReaderStarted	= false,
		isHistoryAPI		= !!(history.pushState && history.state !== undefined),
		initialFire			= window.document.location.href,
		UrlHandlerClass 	= function() {},
		//Check ie version
		isIE = function(ver) {
			var ieNavigatorString = isExplorer.exec(navigator.userAgent.toLowerCase()),
				ver, is;

			if (!ieNavigatorString) return false;

			ver = ver ? ver + '.' : 'msie';
			is = ieNavigatorString[0].indexOf(ver);

			if (is >= 0) return true;
			else return false;
		},
		isBrowser = function(browser) {
			if (!browser) return false;

			if (navigator.userAgent.toLowerCase().indexOf(browser) >= 0) return true;
			else return false;
		},
		extend = function(child, parent) {
			var key,
				toStr = {}.toString,
				astr = '[object Array]';
		
			child = child || {};
		
			for (key in parent) {
				if (!parent.hasOwnProperty(key)) continue;
		
				if (typeof parent[key] === 'object') {
					child[key] = (toStr.call(parent[key]) === astr) ? [] : {};
					extend(parent[key], child[key]);
				} else {
					child[key] = parent[key];
				}
			};
		
			return child;
		},
		addEvent = function(elem, event, callback) {
			if (elem.attachEvent) elem.attachEvent('on' + event, callback);
			else elem.addEventListener(event, callback, false);
		},
		removeEvent = function(elem, event, callback) {
			if (elem.detachEvent) elem.detachEvent('on' + event, callback);
			else elem.removeEventListener(event, callback, false);
		},
		getHash = function() {
			var href = decodeURI(window.location.href),
				match = href.match(/#!*\/*(.*)$/); //match(/#(.*)$/)

			return match ? match[1] : '';
		},
		routeToRegExp = function (route) {
			route = route.replace(escapeRegExp, '\\$&')
						 .replace(namedParam, '([^\/]+)')
						 .replace(splatParam, '(.*?)');

			return new RegExp('^' + route + '$');
		},
		applyHashHandlers = function(obj) {
			for(var key in obj) {
				matchArr = getHash().match(routeToRegExp(key));

				if (!matchArr) continue;
				if (matchArr.length != 1) matchArr.shift();
				if (typeof obj[key] === 'function') obj[key].apply(null, matchArr);
			}
		},
		fireaHashHandlers = function(event) {
			//Fix chrome bug, fire popstate on page load
			/*if (window.chrome) {
				if (initialFire === window.location.href) return initialFire = false;
				initialFire = false;
			}*/

			applyHashHandlers(handlersCollection)
		};

	UrlHandlerClass.prototype = {
		hashReader : function(o) {
			var self = this,
				o = o || {};

			if (handlersCollection) {
				extend(handlersCollection, o);
				if (isHashReaderStarted) {
					this.stop();
					this.start();
				}
			} else {
				handlersCollection = o;
			}

			/**
			 * Start handler on ini
			 */
			//this.start();

			return this;
		},

		/**
		 * Start hash handlers
		 */
		start : function(holdOnStart) {
			if (isHashReaderStarted) return false;

			if ( isHistoryAPI && !isIE() && !isBrowser('opera') ) addEvent(window, 'popstate', fireaHashHandlers);
			else addEvent(window, 'hashchange', fireaHashHandlers);

			if (!holdOnStart) fireaHashHandlers();
			
			isHashReaderStarted = true;
			return this;
		},

		/**
		 * Stop all handlers
		 */
		stop : function() {
			if (!isHashReaderStarted) return false; //dont stop if wasn't started

			if (isHistoryAPI && !isIE()) removeEvent(window, 'popstate', fireaHashHandlers);
			else removeEvent(window, 'hashchange', fireaHashHandlers);

			isHashReaderStarted = false;
			return this;
		},

		/**
		 * Description
		 * @hash {string} Get hash string, and try to fire handlers 
		 */
		triggerHash : function(hash) {
			if (!hash) return false;

			var hash = hash /*|| getHash()*/,
				obj = handlersCollection;

			for(var key in obj) {
				matchArr = hash.match(routeToRegExp(key));

				if (!matchArr) continue;
				if (matchArr.length != 1) matchArr.shift();
				if (typeof obj[key] === 'function') obj[key].apply(null, matchArr);
			}

			return this;
		},

		parseQueryString : function (data) {
			var data = window.location.search || data;

			if (!data) return false;

			var str = decodeURIComponent(data),
				signPos = str.indexOf('?'),
				odd = [],
				even = [],
				result = {},
				newStr;

			if (signPos == -1) return false;
			newStr = str.slice(signPos + 1);
			newStr = newStr.match(/[^=\&]+|\d/g);

			for (var n = 0, max = newStr.length; n < max; n++) {
				if ((n % 2) == 0) odd.push(newStr[n]);
				else even.push(newStr[n]);
			};
			for (var nn = 0, max = odd.length; nn < max; nn++) result[odd[nn]] = even[nn];

			return result;
		},

		isHash : function() {
			return (!this.getHash()) ? false : true;
		},

		getHash : function() {
			return getHash();
		},

		setHash : function(str, push) {
			if (push && isHistoryAPI) history.pushState(null, null, str);
			else window.location.hash = str;

			return this;
		},

		removeHash : function() {
			if (!this.isHash()) return false;

			if (isHistoryAPI) history.pushState(null, null, ' ');
			else this.setHash('');

			return this;
		}
	};

	if (!window.urlHandler) window.urlHandler = new UrlHandlerClass();

	/**
	 * Return UrlHandlerClass
	 */
	return UrlHandlerClass;
}(this));