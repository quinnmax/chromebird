var background;
var char_indicator;
var tweet_button;
var status_box;
var character_limit = 280; // not enforced. t.co and all. just a warning



document.addEventListener('DOMContentLoaded', function(){
	
	// some elements for global access
	char_indicator = document.getElementById('characters_remaining');

	// global var background;	
	background = chrome.extension.getBackgroundPage();
	
	// global var status_box;
	status_box = document.getElementById('statusbox');
	status_box.addEventListener('input',push_status);
	
	// global var tweet_button;
	tweet_button = document.getElementById('tweetbutton');	
	tweet_button.addEventListener('click',request_post_status);
	
	var twitter_icon = document.getElementById('twitterlogo');
	twitter_icon.addEventListener('click',
		function(){ chrome.tabs.create({'url':'https://www.twitter.com',active:false}); });
	
	// get info from current tab,
	// then generate the dynamic content
	scrub_page();
});







function scrub_page( ){

	// should be looking through the linked page for twitter stuff,
	// then storing all of it in the background page.
	// the callback populates the pop-up

	chrome.tabs.query({active:true,lastFocusedWindow:true},
	function(tabs_list){

		var tab_url = tabs_list[0].url;
		// after a '?' in a url, often seems like it should be removed from the link.
		// but for youtube, it defines the page, so it gets an exception :/	
		if(tab_url.indexOf('?') != -1){ 
			if(tab_url.indexOf('youtube.com') == -1){
				tab_url = tab_url.substring(0,tab_url.indexOf('?')); 
			}
		}

		background.tab_url   = tab_url;
		background.tab_title = tabs_list[0].title;
		background.tab_id    = tabs_list[0].id;

		// (not allowed on chrome:// pages, so check and skip them)
		if(background.tab_url.substring(0,9) != 'chrome://'){
			chrome.tabs.executeScript(
				tabs_list[0].id, 
				{file: "scrubber_injection.js"}, 
				setup_popup
			);
		}else{
			console.log("Chrome won't let extensions scrub chrome:// pages, but here's @googlechrome anyway.");
			background.handle_list = ["@googlechrome"];
			background.hashtag_list = [];
			setup_popup();
		}

	});

}







function setup_popup( ){

	// this is where the dynamic buttons are set up
	// based on what was found during the page scrub

	// get the existing status if it's saved in the background
	// (ie, partially written tweets) and repopulate the pop-up

	status_box.value = background.status;
	update_chars_remaining();

	// add highlighted text to the status box
	// (not allowed on chrome:// pages, so check and skip)
	if(background.tab_url.substring(0,9) != 'chrome://'){
		chrome.tabs.executeScript( { code: "window.getSelection().toString();" }, function(selection) {
			if(selection && selection[0].length > 0){
				var initial_length_of_status = status_box.value.length;
				if(initial_length_of_status > 0){
					insert_text_at_cursor( status_box, '\n\n"' + selection[0] + '"\n' );
					statusbox.value = statusbox.value + "\n" + background.tab_url;
					statusbox.focus();
					statusbox.selectionStart = initial_length_of_status + 1;
					statusbox.selectionEnd   = statusbox.value.length;
				}else{
					insert_text_at_cursor( status_box, '"' + selection[0] + '"\n' );
					statusbox.value = statusbox.value + '\n' + background.tab_url;
					statusbox.focus();
					statusbox.selectionStart = 0;
					statusbox.selectionEnd   = statusbox.value.length;	
				}
			}
	  		update_chars_remaining();
		});
	}else{
		console.log("Chrome won't let extensions grab text from chrome:// pages either.");
	}



	// fill in the related search title and buttons

	var search_target = document.getElementById('search_target');
  	search_target.innerText = background.tab_title;

	var search_button = document.getElementById('search_button');
	search_button.setAttribute('query', background.tab_url);
	search_button.addEventListener('click', function(){ 
		chrome.extension.sendRequest({
			"type":"get_search_results",
			"content":search_button.getAttribute('query')
		});
	});

  	var search_follows_button = document.getElementById('search_follows_button');
	search_follows_button.setAttribute('query', background.tab_url);
	search_follows_button.addEventListener('click', function(){ 
		chrome.extension.sendRequest({
			"type":"get_search_results_from_follows",
			"content":search_follows_button.getAttribute('query')
		});
	});



	// add accounts and action buttons
	
	// buttons to add mentions of accounts
	for(var i = 0; i < background.handle_list.length; i++){

		var cur_handle = background.handle_list[i];

		var new_button = document.createElement('button');
		new_button.setAttribute('id','followbutton'+cur_handle);
		new_button.setAttribute('class','button');
		new_button.setAttribute('handle',cur_handle);

		var text_content = document.createElement('span');
		text_content.setAttribute('class','button_text');
		text_content.setAttribute('title','add to tweet')
		text_content.innerText = cur_handle;
		text_content.addEventListener( 'click', function(){ 
			insert_text_at_cursor(status_box,this.innerText);
			status_box.focus();
			update_chars_remaining();
			background.status = status_box.value;
		});
		new_button.appendChild(text_content);

		var button_button = document.createElement('img');
		button_button.setAttribute('id','infobutton'+cur_handle);
		button_button.setAttribute('title','view profile');
		button_button.setAttribute('class','info_icon');
		button_button.setAttribute('src','icons/plus_circle_white.png');
		button_button.setAttribute('content',cur_handle);
		button_button.addEventListener( 'click', function(){
			chrome.windows.create({
				url:"https://twitter.com/intent/user?screen_name="+this.getAttribute('content'),
				height:550,width:640,left:320,top:0
			});
		});
		new_button.appendChild(button_button);

		new_button.addEventListener('mouseover', function(){
			this.childNodes[1].setAttribute('src','icons/spyglass_blue.png');
		});

		new_button.addEventListener('mouseout',function(){
			this.childNodes[1].setAttribute('src','icons/plus_circle_white.png');
		});

		document.getElementById('mention_users').appendChild(new_button);
	}

	if(background.handle_list.length == 0){
		document.getElementById('mention_users').parentNode.removeChild( document.getElementById('mention_users') );
	}



	// buttons to add mentions of hashtags
	for(var i = 0; i < background.hashtag_list.length; i++){

		var cur_hashtag = background.hashtag_list[i];

		var new_button = document.createElement('button');
		new_button.setAttribute('id','followbutton'+cur_hashtag);
		new_button.setAttribute('class','button');
		new_button.setAttribute('title','add to tweet');
		new_button.setAttribute('hashtag',cur_hashtag);

		var text_content = document.createElement('span');
		text_content.innerText = cur_hashtag;
		text_content.addEventListener( 'click', function(){ 
			insert_text_at_cursor(status_box,this.innerText);
			status_box.focus();
			update_chars_remaining();
			background.status = status_box.value;
		});
		new_button.appendChild(text_content);

		var button_button = document.createElement('img');
		button_button.setAttribute('id','infobutton'+cur_hashtag);
		button_button.setAttribute('title','search hashtag');
		button_button.setAttribute('class','info_icon');
		button_button.setAttribute('src','icons/plus_circle_white.png');
		button_button.setAttribute('content',cur_hashtag);
		button_button.addEventListener( 
			'click',
			function(){ 
				chrome.extension.sendRequest({
					"type":"get_hashtag_results",
					"content":this.getAttribute('content').substring(1)
				});
			}
		);
		new_button.appendChild(button_button);

		new_button.addEventListener('mouseover', function(){
			this.childNodes[1].setAttribute('src','icons/spyglass_blue.png');
		});

		new_button.addEventListener('mouseout',function(){
			this.childNodes[1].setAttribute('src','icons/plus_circle_white.png');
		});

		document.getElementById('mention_hashtags').appendChild(new_button);
	}

	if(background.hashtag_list.length == 0){
		document.getElementById('mention_hashtags').parentNode.removeChild( document.getElementById('mention_hashtags') );
	}



  	// if you really wish that icon was blue...
  	var flip_button = document.getElementById('flip_button');
  	if(flip_button){
  		flip_button.addEventListener(
	  		'click', 
	  		function(){flip_bird();}
  		);
  	}



  	// set up the add link button
  	var link_button = document.getElementById('link_button');
  	link_button.setAttribute('query',background.tab_url)
	link_button.addEventListener( 
		'click',
		function(){ 
			insert_text_at_cursor( status_box, this.getAttribute('query') );
			status_box.focus();
			update_chars_remaining();
			background.status = status_box.value;
		}
	);
	


	// set the focus
	// can't figure out how to get this to work right with callbacks...
	setTimeout(function(){ 
		if(status_box.value.length > 0){
			//status_box.focus();
			//status_box.selectionStart = status_box.value.length;
		}else{
			search_button.focus(); 
		}
	}, 100 );

}







function update_chars_remaining(){
	char_indicator.innerText = character_limit - status_box.value.length;
	
	if(status_box.value.length > character_limit){
		char_indicator.style.color = char_indicator.getAttribute('nogoodcolor');
	}else{
		char_indicator.style.color = char_indicator.getAttribute('okcolor');
	}

	if(status_box.value.length==0){
		tweet_button.disabled = true;
		tweet_button.style.cursor = "default";
	}else{
		tweet_button.disabled = false;
		tweet_button.style.cursor = "pointer";
	}
}

function flip_bird(){
	console.log('bird_flip action')
	background.bird_icon_on = !background.bird_icon_on;
	if(background.bird_icon_on){
		chrome.browserAction.setIcon({path:"icons/bird_on.png"});
	}else{
		chrome.browserAction.setIcon({path:"icons/bird_off.png"});
	}
}

function push_status(){
	background.status = status_box.value;
	update_chars_remaining();
}

function request_post_status(){
	//this one catches a highlighted quote from the page, which isn't normally saved to the background
	background.status = status_box.value; 
	chrome.extension.sendRequest({"type":"post_status","content":status_box.value});
}

function insert_text_at_cursor( text_area, insertion_string ){

	var first_half = text_area.value.substring(0,text_area.selectionStart);
	var second_half = text_area.value.substring(text_area.selectionStart);
	var new_value = first_half + insertion_string + second_half;
	text_area.value = new_value;
	text_area.selectionStart = first_half.length + insertion_string.length;
	text_area.selectionEnd   = first_half.length + insertion_string.length;
}













