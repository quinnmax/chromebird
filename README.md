
# Chromebird

Chromebird is an extension for Google Chrome that gathers Twitter-related content from the current web page and makes it easy to tweet or find tweets and accounts related to the current page. 

I often found myself more interested in what people had to say on Twitter than what's being said in the comments section of an article. This tool makes it easy to find what people have tweeted, to track down authors that might be linked in some hard-to-find Twitter button on a page, or to share a link with a quote and some proper attribution.

It was also nice to learn a bit about making Chrome extensions and to try out writing javascript, html, and css (none of which I had much experience with).

It uses Twitter Web Intents (https://dev.twitter.com/web/intents) to do the actual tweeting, so doesn't need any special permissions related to your Twitter account (and actually works just fine if you are logged out or don't have a Twitter account).

# Installation

To install an unpacked extension in Chrome, go to chrome://extensions/ in your browser and click "Load Unpacked" just below the extensions search bar. Then select the directory to which you've downloaded the contents of the extension. 

# Use

Chromebird has a few functionalities so I broke its layout into subsections.

### Tweet box

The tweet section makes it easy compose a tweet in your browser from any page. You can easily add quoted text, a link, and attribution.

If there is text highlighted on the page when you activate the Chromebird extension, the text of the Tweet draft will be populated with the highlighted text and with a link to the current page.

The character count is just a heads up. You may have more room than it indicates as Twitter's url shortening service (t.co) is not taken into account.

### Discover

The discover section consists of two search buttons. The first will open a new window with tweets that link to the current page. This makes it easy to see who has shared a link to the page and what others have to say about it.

The second search button searches for tweets that mention the current page that have been posted by accounts that you follow. If you just want to see if you're the first in your group to post a link, this makes it easy to find out.

### Mention

The mention section makes it easy to find Twitter account handles that are related to the current page. Chromebird scrubs the current page for links to Twitter accounts, for accounts associated with embedded tweets on the page, and for accounts and hashtags associated with Twitter API buttons on the page. 

Each account and hashtag found gets a button in the mention section. Clicking the button will add the account handle or hashtag to the tweet box. Hovering over the button reveals a little search icon that, when clicked, will show some profile information for the account. 

# Notes

The code that does the scrubbing for Twitter-related content is pretty hacky. If this project were to catch my attention again, I'd probably start by looking at `scrubber_injection.js`. As it is, it looks for Twitter accounts in a few places, including: 
- links that explicitly point to twitter.com (with a black list of pages that are non-account pages, like twitter.com/about, of which there are relatively few)
- account information embedded in tweet buttons
- account information included in embedded tweets (which means digging into iframes a little)

Opening the tool while on twitter.com can make Chromebird go a little crazy, as it will create buttons for every account and hashtag on the page, but it doesn't seem to be an actual problem.

Although I tried to keep styling and language consistent with Twitter proper, alas, this project has no association with Twitter Inc.















