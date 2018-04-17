var handle_list  = [];
var hashtag_list = [];
var cur_url;



function handle_from_url( input_url ){

	var handle;

	if( input_url.indexOf("//twitter.com/#!/") != -1 ){
		var substring_index = input_url.indexOf("twitter.com/#!/");
		handle = input_url.substring(substring_index+15);
	}else if( input_url.indexOf("//twitter.com/") != -1 ){
		var substring_index = input_url.indexOf("twitter.com/");
		handle = input_url.substring(substring_index+12);

	}else if( input_url.indexOf("www.twitter.com/#!/") != -1 ){
		var substring_index = input_url.indexOf("twitter.com/#!/");
		handle = input_url.substring(substring_index+15);
	}else if( input_url.indexOf("www.twitter.com/") != -1 ){
		var substring_index = input_url.indexOf("twitter.com/");
		handle = input_url.substring(substring_index+12);

	}else if( input_url.indexOf("mobile.twitter.com/#!/") != -1 ){
		var substring_index = input_url.indexOf("twitter.com/#!/");
		handle = input_url.substring(substring_index+15);
	}else if( input_url.indexOf("mobile.twitter.com/") != -1 ){
		var substring_index = input_url.indexOf("twitter.com/");
		handle = input_url.substring(substring_index+12);

	}else if( input_url.indexOf('/search?q=') != -1 ){
		handle = input_url.substring(1);
	
	}else{
		return;
	}

	// intercept hashtags
	if(handle.substring(0,7) == 'hashtag'){
		var index_of_qmark = handle.indexOf("?");
		if( index_of_qmark > 0 ){handle = handle.substring(0,index_of_qmark);}
		handle = handle.substring(8);
		hashtag_list[hashtag_list.length] = handle;
		console.log("chromebird: found HASHTAG: " + handle + " from " + input_url);
		return;
	}

	// // intercept searches	
	// if(handle.substring(0,9) == 'search?q='){
	// 	var query = handle.substring(9);
	// 	var index_of_amp = query.indexOf("&");
	// 	if( index_of_amp != -1 ){ query = query.substring(0,index_of_amp);}
	// 	console.log("SEARCH QUERY: " + query);
	// 	hashtag_list[hashtag_list.length] = query;
	// 	return;
	// }


	var index_of_slash = handle.indexOf("/");
	if (index_of_slash != -1){ handle = handle.substring(0,index_of_slash); }

	var index_of_quest = handle.indexOf("?");
	if (index_of_quest != -1){ handle = handle.substring(0,index_of_quest); }
	
	if( handle.length <= 0		||
		handle == '#!'			||
		handle == 'about'		||
		handle == 'goodies'		||
		handle == 'hashtag'		||
		handle == 'home'		||
		handle == 'i'			||
		handle == 'intent'		||
		handle == 'jobs'		||
		handle == 'login'		||
		handle == 'logout'		||
		handle == 'privacy'		||
		handle == 'search'		||
		handle == 'search-home'	||
		handle == 'settings'	||
		handle == 'share'		||
		handle == 'signup'		||
		handle == 'tos'			||
		handle.indexOf('+') == 0){
			return
	}else{
		console.log("chromebird: found HANDLE: " + handle + " from " + input_url);
		return handle;
	}
}



// look for user names metadata
//
// the logic for what's in the twitter meta tag seems pretty inconsistent
// some have property:twitter*, some have name:twitter*
// then the handles might be content:handle or value:handle
//
// these are just some hacky combinations that find a good chunk of them

var elements_meta = document.getElementsByTagName("meta");
for (var i = 0; i < elements_meta.length; i++ ){
	var cur_property = elements_meta[i].getAttribute("property");
	if( cur_property == "twitter:creator" || cur_property == "twitter:site" ){
		
		var handle = elements_meta[i].getAttribute("content");
		console.log("chromebird: found HANDLE: " + handle + " used: twitter:creator or twitter:site metadata");
		handle_list[handle_list.length] = handle;

		var handle = elements_meta[i].getAttribute("value");
		console.log("chromebird: found HANDLE: " + handle + " used: twitter:creator or twitter:site metadata");
		handle_list[handle_list.length] = handle;
	}
}
for (var i = 0; i < elements_meta.length; i++ ){
	var cur_property = elements_meta[i].getAttribute("name");
	if( cur_property == "twitter:creator" || cur_property == "twitter:site" ){

		var handle = elements_meta[i].getAttribute("content");
		console.log("chromebird: found HANDLE: " + handle + " used: twitter:creator or twitter:site metadata");
		handle_list[handle_list.length] = handle;

		var handle = elements_meta[i].getAttribute("value");
		console.log("chromebird: found HANDLE: " + handle + " used: twitter:creator or twitter:site metadata");
		handle_list[handle_list.length] = handle;
	}
}

// get medium.com author
var author_node = document.getElementsByClassName('postMetaInline--authorDateline')[0];
if(author_node){	
	var author_link = author_node.childNodes[0].getAttribute("href")
	if(author_link){handle_list[handle_list.length] = author_link.substring(1);}
}

// get medium.com profile page name
var hero_node = document.getElementsByClassName('hero-title')[0];
if( hero_node && typeof(hero_node.childNodes[0]) == "node"){
	var link = hero_node.childNodes[0].getAttribute("href");
	if(link){handle_list[handle_list.length] = link.substring(1);}
}

var elements_users = document.getElementsByTagName("li");
for (var i = 0; i < elements_users.length; i++ ){
	var name_attribute = elements_users[i].getAttribute("data-screen-name");
	if(name_attribute){ 
		handle_list[handle_list.length] = name_attribute;
		console.log("chromebird: found HANDLE: " + name_attribute + " used: data-screen-name attribute");
	}
}


// looking into the button iframe for screen names

var elements_iframe = document.getElementsByTagName("iframe");
for (var i = 0; i < elements_iframe.length; i++ ){
	var cur_id = elements_iframe[i].getAttribute("id");
	if(cur_id && cur_id.match(/twitter-widget/gi)){
		var src = elements_iframe[i].getAttribute("src");
		if(src){
			var n = src.indexOf("screen_name=");
			if(n>-1){
				var src_trimmed = src.substring(n);
				if(src_trimmed){
					var m = src_trimmed.indexOf("&");
					
					src_trimmed = src_trimmed.substring(0,m);
					handle_list[handle_list.length] = src_trimmed.substring(12);

				}
			}
		}
	}
}



// dig into iframes a little bit
// this gets info from embedded tweets, but is not selective for them
// the double depth is for pages that wrap the embedded tweet in an iframe...like medium.com does

var iframes = document.getElementsByTagName("iframe");
for(var i = 0; i < iframes.length; i++){

	if( 
		(iframes[i].getAttribute('class') != null ? iframes[i].getAttribute('class').indexOf('twitter-tweet')        : -1) > -1 ||
		(iframes[i].getAttribute('class') != null ? iframes[i].getAttribute('class').indexOf('twitter-tweet-button') : -1) > -1 ||
		(iframes[i].getAttribute('src')   != null ? iframes[i].getAttribute('src').indexOf('https://twitter.com/')   : -1) > -1
		// iframes[i].getAttribute("class").indexOf('twitter-timeline') > -1
	){

		console.log('in iframe: ' + i);

		var links_list = iframes[i].contentWindow.document.getElementsByTagName('a');
		for(var j = 0; j < links_list.length; j++){
			handle_list[handle_list.length] = handle_from_url( links_list[j].getAttribute('href') );
		}

	}

	// for stuff like medium wrapping iframes in iframes
	// this isn't very thorough, but takes care of a few cases

	try{
		var sub_iframes = iframes[i].contentWindow.document.getElementsByTagName("iframe");
		for(var j = 0; j < sub_iframes.length; j++){
			var links_list = sub_iframes[j].contentWindow.document.getElementsByTagName('a');
			for(var k = 0; k < links_list.length; k++){
				if( links_list[k].getAttribute('href').substring('hashtag') != -1){
					console.log('chromebird: # ' + links_list[k].getAttribute('href') );
				}
				handle_list[handle_list.length] = handle_from_url( links_list[k].getAttribute('href') );
			}
		}
	}catch(the_error){
			console.log("chromebird: error but don't caror: " + the_error);
	}
}



// look for general twitter links
// this can go bonkers on twitter.com or medium.com or sites that have a million twitter links
var elements_a = document.getElementsByTagName("a");
for (var i = 0; i < elements_a.length; i++ ){

	// check for profile links
	if( elements_a[i].getAttribute("class")=="account-group js-account-group js-action-profile js-user-profile-link js-nav" ||
		elements_a[i].getAttribute("class")=="ProfileTweet-originalAuthorLink u-linkComplex js-nav js-user-profile-link"){
		handle_list[handle_list.length] = "@" + elements_a[i].getAttribute("href").substring(1);
	}

	var cur_href = elements_a[i].getAttribute("href");
	if(cur_href){
		var handle = handle_from_url(cur_href);
		if(handle){ 
			handle_list[handle_list.length] = handle;
		}


	}

	// check for hashtag links
	if(cur_href){
		if(cur_href.substring(1,8)=="hashtag"){
			var cur_hashtag = cur_href;
			var index_of_qmark = cur_hashtag.indexOf("?");
			if( index_of_qmark > 0 ){cur_hashtag = cur_hashtag.substring(0,index_of_qmark);}
			console.log("chromebird: found HASHTAG: " + cur_hashtag.substring(9));
			hashtag_list[hashtag_list.length] = cur_hashtag.substring(9);
		}
	}
}











// remove blanks
handle_list = handle_list.filter(function(n){ return n != undefined });
handle_list = handle_list.filter(function(n){ return n != "" });

hashtag_list = hashtag_list.filter(function(n){ return n != undefined });
hashtag_list = hashtag_list.filter(function(n){ return n != "" });
hashtag_list = hashtag_list.filter(function(n){ return n != "#" });

// give handles the @
for (var i = 0; i < handle_list.length; i++){
	if ( handle_list[i][0] != '@' ){ handle_list[i] = '@' + handle_list[i];}
}

// give hashtags the #
for (var i = 0; i < hashtag_list.length; i++){
	if ( hashtag_list[i][0] != '#' ){ hashtag_list[i] = '#' + hashtag_list[i];}
}



// remove duplicates
handle_list = handle_list.filter(function(elem, pos) { return handle_list.map(function(h){return h.toLowerCase();}).indexOf(elem.toLowerCase()) == pos; })
hashtag_list = hashtag_list.filter(function(elem, pos) { return hashtag_list.map(function(h){return h.toLowerCase();}).indexOf(elem.toLowerCase()) == pos; })

// send handles to the background page so they can be accessed by popup.js
chrome.extension.sendRequest({"type":"take_these_handles","content":handle_list});
chrome.extension.sendRequest({"type":"take_these_hashtags","content":hashtag_list});





