
# Chromebird

![Chromebird](icons/twextension.png )

Chromebird is an extension for Google Chrome that searches the active web page, finds related tweets and accounts, and makes it easy to share links.

I made Chromebird because I often found myself more interested in what people had to say on Twitter than what's being said in the comments section of an article. This tool makes it easy to find what people have tweeted, to track down authors that might be linked in some hard-to-find Twitter button on a page, or to share.

It was also nice to learn a bit about making Chrome extensions and to try out writing javascript, html, and css (none of which I had much experience with).

It uses Twitter Web Intents (https://dev.twitter.com/web/intents) to do the actual tweeting and searching, so no special permissions related to your Twitter account are required (and actually works just fine if you are logged out of Twitter or don't have an account).

# Installation

To install a packed extension (.crx file), go to `chrome://extensions/` in your browser and drag the extension file into the Chrome window.

To install an unpacked extension in Chrome, go to `chrome://extensions/` in your browser. Turn on "Developer mode" in the upper right. Then, click "Load Unpacked" (found just below the extensions search bar). Select the directory to which you've downloaded the contents of the extension and you should be good to go. You can turn off developer mode and the unpacked extension will remain.

# Permissions

Chromebird needs scary looking permissions (specifically "Read and change all your data on the websites you visit"), but it really doesn't do anything fancy. It reads what's on the page so it can search for Twitter handles and copy highlighted text. This never gets sent anywhere. The only sending that's done is when you search Twitter (which sends your current URL to Twitter as the search query) or when you use the tweet box (which sends the content of the Chromebird tweet box to Twitter).

# Use

Chromebird has a few functionalities so I broke its layout into subsections.

### Tweet

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















