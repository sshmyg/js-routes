Javascript hash routes
===========

### Usage:
```javascript

urlHandler.hashReader({
	'location/:id 		: function(id) {}, 				// hash contain location str and something after like #location/id798
	'*actions'			: function(actions) {}, 		// matches http://example.com/#anything-here
	'posts/:id' 		: function(id) {}, 				// matches http://example.com/#/posts/121
	'download/*path'	: function(path) {}, 			// matches http://example.com/#/download/user/images/hey.gif
	':route/:action'	: function(route, action) {}	// matches http://example.com/#/dashboard/graph
});

```
### API hash reader
By default hashReader is stoped on init;
```javascript

urlHandler.start(); 			//start hashReader
urlHandler.start(true); 		//start with hold (handler doesn't fire on start, just onpopstate or hashchange)
urlHandler.stop(); 				//stop hashReader
urlHandler.triggerHash(str); 	//trigger hashReader stroed hash handler

```

### Other API

```javascript

urlHandler.parseQueryString(); 		//Get data from query string (?data=125&data2=458)
urlHandler.isHash(); 				//Is hash
urlHandler.setHash(); 				//Set hash
urlHandler.getHash(); 				//Get hash
urlHandler.removeHash(); 			//Remove hash

```
