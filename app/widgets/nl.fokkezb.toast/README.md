# Alloy Toast Widget [![Appcelerator Alloy](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://appcelerator.com/alloy/)

Another [Alloy](http://appcelerator.com/alloy) [Widget](http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Widgets) for a cross-platform in-app Android toast-like notification system. On Android it wraps `Ti.UI.Notification` while on iOS (and others) it's a `Ti.UI.Window` containing a label.

## Screencasts

![iOS](https://github.com/FokkeZB/nl.fokkezb.toast/blob/master/screencasts/ios.gif?raw=true) ![Android](https://github.com/FokkeZB/nl.fokkezb.toast/blob/master/screencasts/android.gif?raw=true)

## Get it [![gitTio](http://gitt.io/badge.png)](http://gitt.io/component/nl.fokkezb.toast)

Install via [gitTio](http://gitt.io/component/nl.fokkezb.toast):

	$ gittio install nl.fokkezb.toast

Or download a [release](https://github.com/FokkeZB/nl.fokkezb.toast/releases), extract it to your app's `app/widgets/nl.fokkezb.toast` folder and add the dependency to your `config.json`:

	{
		..
		"dependencies": {
		    "nl.fokkezb.toast": "*"
		    ..
		  }
	}
	
## Use it

### Global instance

#### alloy.js

	var toast = Alloy.createWidget('nl.fokkezb.toast', 'global', {
		// defaults
	});
	
	Alloy.Globals.toast = toast.show; 	// same as toast.info
	Alloy.Globals.error = toast.error;	// applies the 'error' theme
	
	
##### index.js

	Alloy.Globals.toast('hello world');
	Alloy.Globals.error('hello world');
	
### Local instances

#### index.js

	Alloy.createWidget('toast').show('hello world', {
	
		theme: 'error',		// adds .nlFokkezbToast_[view|label]_error class
		persistent: true	// stay open until clicked on
	
	});
	
### Modal windows
If a modal window is open, the toast will not be visible. When a modal window is open, pass a reference to the window via the `view` property to have the toast added to the window instead of creating its own:

	Alloy.Globals.error('bye world', {
		view: $.win
	});
	
**NOTE:** The view you refer needs to have a composite layout (the default).
	
## Style it

Use the [classes](styles/widget.tss) in your `themes/yourTheme/widgets/nl.fokkezb.toast/styles/widget.tss` (Alloy 1.4.0+) or `styles/app.tss` to style the views and also set the entry and exit properties to animate on iOS.

### Themes
The `theme` property will simple prefixed with `nlFokkezbToast_view` and `nlFokkezbToast_label` after which these classes will be added to the view and label. Override the classes to change their styles.

## Todo
Feel free to send PRs for these or other features:

* Support queueing instead of overlaying multiple messages.
* Support stacking instead of overlaying multiple messages.

## Alternatives
Other widgets and why they didn't work for me:

|Widget|Didn't work for me because|
|------|-----------------|
|[net.beyondlink.toast](http://gitt.io/component/net.beyondlink.toast)|Nice features, but themes not styleable|
|[com.mcongrove.toast](http://gitt.io/component/com.mcongrove.toast)|Position and animation not stylable|

## License

	The MIT License (MIT)
	
	Copyright (c) 2014 Fokke Zandbergen
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
