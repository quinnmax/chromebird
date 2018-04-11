

// things that should persist after closing the drop-down

var status = ""; // stores the status entered into the drop-down
var bird_icon_on = false;
var handle_list;
var hashtag_list;
var tab_url;
var tab_title;
var tab_id;



// listener for requests from the drop-down

chrome.extension.onRequest.addListener(on_request);

function on_request(request, sender, callback){
	
	if(request.type == "post_status"){
		post_tweet(request.content);		
	}

	// this receives the findings scrubber_injection.js
	// and makes them available to the drop-down
	if(request.type == "take_these_handles"){
		handle_list = request.content;
	}
	if(request.type == "take_these_hashtags"){
		hashtag_list = request.content;
	}

	// window width is set to fit the center column of the search results
	// left offset is meant to push it off screen, which chrome will then put as far to the right as it can
	//   while still showing everything
	// the injection deletes the left and right columns of the search results page, 
	// and floats the center column to the left
	if(request.type == "get_search_results"){
		chrome.windows.create({url:"https://twitter.com/search?q=" + request.content,width:622,height:screen.height,left:screen.width},
			function(new_window){
				chrome.tabs.executeScript(
					new_window.tabs[0].id, 
					{file: "search_results_injection.js"}
				);
			});
	}

	if(request.type == "get_search_results_from_follows"){
		chrome.windows.create({url:"https://twitter.com/search?s=follows&q=" + request.content,width:622,height:screen.height,left:screen.width},
			function(new_window){
				chrome.tabs.executeScript(
					new_window.tabs[0].id, 
					{file: "search_results_injection.js"}
				);
			});
	}
	
	if(request.type == "get_hashtag_results"){
		chrome.windows.create({url:"https://twitter.com/hashtag/" + request.content,width:622,height:screen.height,left:screen.width},
			function(new_window){
				chrome.tabs.executeScript(
					new_window.tabs[0].id, 
					{file: "search_results_injection.js"}
				);
			});
	}

}



// posting tweets needs to happen from the background because the extension drop-down closes as soon as 
// the tweet intent pop-up opens
function post_tweet(content){
	var temp = status;
	temp = encodeURIComponent(temp);
	status = "";
	chrome.windows.create({'url':'https://www.twitter.com/home?status='+temp,height:300,width:680,left:320,top:0,type:"panel"});
}


















