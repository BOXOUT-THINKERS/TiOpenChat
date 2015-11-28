/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIWEBVIEW

#import "TiUIWebView.h"
#import "TiUIWebViewProxy.h"
#import "TiApp.h"
#import "TiUtils.h" 
#import "TiProxy.h"
#import "SBJSON.h"
#import "TiHost.h"
#import "Webcolor.h"
#import "TiBlob.h"
#import "TiFile.h"
#import "Mimetypes.h"
#import "Base64Transcoder.h"

extern NSString * const TI_APPLICATION_ID;
static NSString * const kTiOpenChatJavascript = @"Ti.App={};Ti.API={};Ti.App._listeners={};Ti.App._listener_id=1;Ti.App.id=Ti.appId;Ti.App._xhr=XMLHttpRequest;"
		"Ti._broker=function(module,method,data){try{var url='app://'+Ti.appId+'/_TiA0_'+Ti.pageToken+'/'+module+'/'+method+'?'+Ti.App._JSON(data,1);"
			"var xhr=new Ti.App._xhr();xhr.open('GET',url,false);xhr.send()}catch(X){}};"
		"Ti._hexish=function(a){var r='';var e=a.length;var c=0;var h;while(c<e){h=a.charCodeAt(c++).toString(16);r+='\\\\u';var l=4-h.length;while(l-->0){r+='0'};r+=h}return r};"
		"Ti._bridgeEnc=function(o){return'<'+Ti._hexish(o)+'>'};"
		"Ti.App._JSON=function(object,bridge){var type=typeof object;switch(type){case'undefined':case'function':case'unknown':return undefined;case'number':case'boolean':return object;"
			"case'string':if(bridge===1)return Ti._bridgeEnc(object);return'\"'+object.replace(/\"/g,'\\\\\"').replace(/\\n/g,'\\\\n').replace(/\\r/g,'\\\\r')+'\"'}"
			"if((object===null)||(object.nodeType==1))return'null';if(object.constructor.toString().indexOf('Date')!=-1){return'new Date('+object.getTime()+')'}"
			"if(object.constructor.toString().indexOf('Array')!=-1){var res='[';var pre='';var len=object.length;for(var i=0;i<len;i++){var value=object[i];"
			"if(value!==undefined)value=Ti.App._JSON(value,bridge);if(value!==undefined){res+=pre+value;pre=', '}}return res+']'}var objects=[];"
			"for(var prop in object){var value=object[prop];if(value!==undefined){value=Ti.App._JSON(value,bridge)}"
			"if(value!==undefined){objects.push(Ti.App._JSON(prop,bridge)+': '+value)}}return'{'+objects.join(',')+'}'};"
		"Ti.App._dispatchEvent=function(type,evtid,evt){var listeners=Ti.App._listeners[type];if(listeners){for(var c=0;c<listeners.length;c++){var entry=listeners[c];if(entry.id==evtid){entry.callback.call(entry.callback,evt)}}}};Ti.App.fireEvent=function(name,evt){Ti._broker('App','fireEvent',{name:name,event:evt})};Ti.API.log=function(a,b){Ti._broker('API','log',{level:a,message:b})};Ti.API.debug=function(e){Ti._broker('API','log',{level:'debug',message:e})};Ti.API.error=function(e){Ti._broker('API','log',{level:'error',message:e})};Ti.API.info=function(e){Ti._broker('API','log',{level:'info',message:e})};Ti.API.fatal=function(e){Ti._broker('API','log',{level:'fatal',message:e})};Ti.API.warn=function(e){Ti._broker('API','log',{level:'warn',message:e})};Ti.App.addEventListener=function(name,fn){var listeners=Ti.App._listeners[name];if(typeof(listeners)=='undefined'){listeners=[];Ti.App._listeners[name]=listeners}var newid=Ti.pageToken+Ti.App._listener_id++;listeners.push({callback:fn,id:newid});Ti._broker('App','addEventListener',{name:name,id:newid})};Ti.App.removeEventListener=function(name,fn){var listeners=Ti.App._listeners[name];if(listeners){for(var c=0;c<listeners.length;c++){var entry=listeners[c];if(entry.callback==fn){listeners.splice(c,1);Ti._broker('App','removeEventListener',{name:name,id:entry.id});break}}}};";

static NSString * const kMimeTextHTML = @"text/html";
static NSString * const kContentData = @"kContentData";
static NSString * const kContentDataEncoding = @"kContentDataEncoding";
static NSString * const kContentTextEncoding = @"kContentTextEncoding";
static NSString * const kContentMimeType = @"kContentMimeType";
static NSString * const kContentInjection = @"kContentInjection";


NSString *HTMLTextEncodingNameForStringEncoding(NSStringEncoding encoding)
{
	if (encoding == NSUTF8StringEncoding) {
		return @"utf-8";
	} else if (encoding == NSUTF16StringEncoding) {
		return @"utf-16";
	} else if (encoding == NSASCIIStringEncoding) {
		return @"us-ascii";
	} else if (encoding == NSISOLatin1StringEncoding) {
		return @"latin1";
	} else if (encoding == NSShiftJISStringEncoding) {
		return @"shift_jis";
	} else if (encoding == NSWindowsCP1252StringEncoding) {
		return @"windows-1251";
	}
	return nil;
}

@interface LocalProtocolHandler : NSURLProtocol
@end
 
@implementation TiUIWebView
@synthesize reloadData, reloadDataProperties;

-(void)dealloc
{
	if (webview!=nil)
	{
		webview.delegate = nil;
		
		// per doc, must stop webview load before releasing
		if (webview.loading)
		{
			[webview stopLoading];
		}
	}
	if (listeners!=nil)
	{
		RELEASE_TO_NIL(listeners);
	}
	RELEASE_TO_NIL(pageToken);
	RELEASE_TO_NIL(webview);
	RELEASE_TO_NIL(url);
	RELEASE_TO_NIL(spinner);
	RELEASE_TO_NIL(basicCredentials);
	RELEASE_TO_NIL(reloadData);
	RELEASE_TO_NIL(reloadDataProperties);
	RELEASE_TO_NIL(lastValidLoad);
	[super dealloc];
}


+ (BOOL)isLocalURL:(NSURL *)url
{
	NSString *scheme = [url scheme];
	return [scheme isEqualToString:@"file"] || [scheme isEqualToString:@"app"];
}

-(UIView*)hitTest:(CGPoint)point withEvent:(UIEvent *)event
{
	/*	webview is a little _special_ and refuses to share events.
	 *	As such, we have to take the events away if we have event listeners
	 *	Or let webview has his entire cake. Through experimenting, if the
	 *	webview is interested, a subview or subsubview will be the target.
	 */

	UIView *view = [super hitTest:point withEvent:event];
	if ( ([self hasTouchableListener]) && willHandleTouches )
	{
		UIView *superview = [view superview];
		UIView *superduperview = [superview superview];
		if ((view == webview) || (superview == webview) || (superduperview == webview))
		{
			return self;
		}
	}
	
	return view;
}

-(void)setWillHandleTouches_:(id)args
{
    willHandleTouches = [TiUtils boolValue:args def:YES];
}


-(UIWebView*)webview 
{
	if (webview==nil)
	{
		// we attach the XHR bridge the first time we need a webview
		[[TiApp app] attachXHRBridgeIfRequired];
		
		webview = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, 10, 1)];
		webview.delegate = self;
		webview.opaque = NO;
		webview.backgroundColor = [UIColor whiteColor];
		webview.contentMode = UIViewContentModeRedraw;
		webview.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
		[self addSubview:webview];

		BOOL hideLoadIndicator = [TiUtils boolValue:[self.proxy valueForKey:@"hideLoadIndicator"] def:NO];
		
		// only show the loading indicator if it's a remote URL and 'hideLoadIndicator' property is not set.
		if (![[self class] isLocalURL:url] && !hideLoadIndicator)
		{
			TiColor *bgcolor = [TiUtils colorValue:[self.proxy valueForKey:@"backgroundColor"]];
			UIActivityIndicatorViewStyle style = UIActivityIndicatorViewStyleGray;
			if (bgcolor!=nil)
			{
				// check to see if the background is a dark color and if so, we want to 
				// show the white indicator instead
				if ([Webcolor isDarkColor:[bgcolor _color]])
				{
					style = UIActivityIndicatorViewStyleWhite;
				} 
			}
			spinner = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:style];
			[spinner setHidesWhenStopped:YES];
			spinner.autoresizingMask = UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin | UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleRightMargin;
			[self addSubview:spinner];
			[spinner sizeToFit];
			[spinner startAnimating];
		}
	}
	return webview;
}

- (id)accessibilityElement
{
	return [self webview];
}

-(void)loadURLRequest:(NSMutableURLRequest*)request
{
	if (basicCredentials!=nil)
	{
		[request setValue:basicCredentials forHTTPHeaderField:@"Authorization"];
	}
	[[self webview] loadRequest:request];
}

-(void)frameSizeChanged:(CGRect)frame bounds:(CGRect)bounds
{
    [super frameSizeChanged:frame bounds:bounds];
	if (webview!=nil)
	{
		[TiUtils setView:webview positionRect:bounds];
		
		if (spinner!=nil)
		{
			spinner.center = self.center;
		}		
	}
}

-(NSURL*)fileURLToAppURL:(NSURL*)url_
{
	NSString *basepath = [TiHost resourcePath];
	NSString *urlstr = [url_ path];
	NSString *path = [urlstr stringByReplacingOccurrencesOfString:[NSString stringWithFormat:@"%@/",basepath] withString:@""];
	if ([path hasPrefix:@"/"])
	{
		path = [path substringFromIndex:1];
	}
	return [NSURL URLWithString:[[NSString stringWithFormat:@"app://%@/%@",TI_APPLICATION_ID,path] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
}

- (NSString *)_tiopenchatInjection
{
	if (pageToken==nil) {
		pageToken = [[NSString stringWithFormat:@"%lu",(unsigned long)[self hash]] retain];
		[(TiUIWebViewProxy*)self.proxy setPageToken:pageToken];
	}
	NSMutableString *html = [[[NSMutableString alloc] init] autorelease];
	[html appendString:@"<script id='__ti_injection'>"];
	NSString *ti = [NSString stringWithFormat:@"%@%s",@"Ti","tanium"];
	[html appendFormat:@"window.%@={};window.Ti=%@;Ti.pageToken=%@;Ti.appId='%@';",ti,ti,pageToken,TI_APPLICATION_ID];
	[html appendString:kTiOpenChatJavascript];
	[html appendString:@"</script>"];
	return html;
}

+ (NSString *)content:(NSString *)content withInjection:(NSString *)injection
{
	if ([content length] == 0) {
		return content;
	}
	// attempt to make well-formed HTML and inject in our TiOpenChat bridge code
	// However, we only do this if the content looks like HTML
	NSRange range = [content rangeOfString:@"<html"];
	if (range.location == NSNotFound) {
		//TODO: Someone did a DOCTYPE, and our search wouldn't find it. This search is tailored for him
		//to cause the bug to go away, but is this really the right thing to do? Shouldn't we have a better
		//way to check?
		range = [content rangeOfString:@"<!DOCTYPE html"];
	}
	
	if (range.location != NSNotFound) {
		NSMutableString *html = [[NSMutableString alloc] initWithCapacity:[content length]+2000];
		NSRange nextRange = [content rangeOfString:@">" options:0 range:NSMakeRange(range.location, [content length]-range.location) locale:nil];
		if (nextRange.location != NSNotFound) {
			[html appendString:[content substringToIndex:nextRange.location+1]];
			[html appendString:injection];
			[html appendString:[content substringFromIndex:nextRange.location+1]];
		} else {
			// oh well, just jack it in
			[html appendString:injection];
			[html appendString:content];
		}
		
		return [html autorelease];
	}
	return content;
}

-(void)loadHTML:(NSString*)content
	   encoding:(NSStringEncoding)encoding 
	   textEncodingName:(NSString*)textEncodingName
	   mimeType:(NSString*)mimeType
	   baseURL:(NSURL*)baseURL
{
	if (baseURL == nil) {
		baseURL = [NSURL fileURLWithPath:[TiHost resourcePath]];
	}
	content = [[self class] content:content withInjection:[self _tiopenchatInjection]];
	
	[self ensureLocalProtocolHandler];
	[[self webview] loadData:[content dataUsingEncoding:encoding] MIMEType:mimeType textEncodingName:textEncodingName baseURL:baseURL];
	if (scalingOverride==NO) {
		[[self webview] setScalesPageToFit:NO];
	}
}

-(void)loadFile:(NSString*)absolutePath
	   encoding:(NSStringEncoding)encoding
		textEncodingName:(NSString*)textEncodingName
	   mimeType:(NSString*)mimeType
{
	NSURL *requestURL = [NSURL fileURLWithPath:absolutePath];
	NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:requestURL];
	[NSURLProtocol setProperty:textEncodingName forKey:kContentTextEncoding inRequest:request];
	[NSURLProtocol setProperty:mimeType forKey:kContentMimeType inRequest:request];
	
	[self loadURLRequest:request];
	if (scalingOverride==NO) {
		[[self webview] setScalesPageToFit:NO];
	}
}

-(UIScrollView*)scrollview
{
	UIWebView* webView = [self webview];
	if ([webView respondsToSelector:@selector(scrollView)]) {
		// as of iOS 5.0, we can return the scroll view
		return [webView scrollView];
	} else {
		// in earlier versions, we need to find the scroll view
		for (id subview in [webView subviews]) {
			if ([subview isKindOfClass:[UIScrollView class]]) {
				return (UIScrollView*)subview;
			}
		}
	}
	return nil;
}


#pragma mark Public APIs

-(id)url
{
	NSString * result =[[[webview request] URL] absoluteString];
	if (result!=nil)
	{
		return result;
	}
	return url;
}

- (void)reload
{
    RELEASE_TO_NIL(lastValidLoad);
	if (webview == nil)
	{
		return;
	}
	if (reloadData != nil)
	{
		[self performSelector:reloadMethod withObject:reloadData withObject:reloadDataProperties];
		return;
	}
	[webview reload];
}

- (void)stopLoading
{
	[webview stopLoading];
}

- (void)goBack
{
	[webview goBack];
}

- (void)goForward
{
	[webview goForward];
}

-(BOOL)isLoading
{
	return [webview isLoading];
}

-(BOOL)canGoBack
{
	return [webview canGoBack];
}

-(BOOL)canGoForward
{
	return [webview canGoForward];
}

-(void)setBackgroundColor_:(id)color
{
	UIColor *c = [Webcolor webColorNamed:color];
	[self setBackgroundColor:c];
	[[self webview] setBackgroundColor:c];
}

-(void)setAutoDetect_:(NSArray*)values
{
	UIDataDetectorTypes result = UIDataDetectorTypeNone;
	for (NSNumber * thisNumber in values)
	{
		result |= [TiUtils intValue:thisNumber];
	}
	[[self webview] setDataDetectorTypes:result];
}

-(void)setHtml_:(NSString*)content withObject:(id)property
{
    NSString *baseURLString = [TiUtils stringValue:@"baseURL" properties:property];
    NSURL *baseURL = baseURLString == nil ? nil : [NSURL URLWithString:baseURLString];
    NSString *mimeType = [TiUtils stringValue:@"mimeType" properties:property def:kMimeTextHTML];
	ignoreNextRequest = YES;
	[self setReloadData:content];
	[self setReloadDataProperties:property];
	reloadMethod = @selector(setHtml_:withObject:);
	RELEASE_TO_NIL(lastValidLoad);
	[self loadHTML:content encoding:NSUTF8StringEncoding textEncodingName:@"utf-8" mimeType:mimeType baseURL:baseURL];
}

-(void)setData_:(id)args
{
	ignoreNextRequest = YES;
	[self setReloadData:args];
	[self setReloadDataProperties:nil];
	reloadMethod = @selector(setData_:);
	RELEASE_TO_NIL(url);
	RELEASE_TO_NIL(lastValidLoad);
	ENSURE_SINGLE_ARG(args,NSObject);
	
	[self stopLoading];

	if ([args isKindOfClass:[TiBlob class]])
	{
		TiBlob *blob = (TiBlob*)args;
		TiBlobType type = [blob type];
		switch (type)
		{
			case TiBlobTypeData:
			{
				[self ensureLocalProtocolHandler];
				[[self webview] loadData:[blob data] MIMEType:[blob mimeType] textEncodingName:@"utf-8" baseURL:nil];
				if (scalingOverride==NO)
				{
					[[self webview] setScalesPageToFit:YES];
				}
				break;
			}
			case TiBlobTypeFile:
			{
				url = [[NSURL fileURLWithPath:[blob path]] retain];
				[self loadLocalURL];
				break;
			}
			default:
			{
				[self.proxy throwException:@"invalid blob type" subreason:[NSString stringWithFormat:@"expected either file or data blob, was: %d",type] location:CODELOCATION];
			}
		}
	}
	else if ([args isKindOfClass:[TiFile class]])
	{
		TiFile *file = (TiFile*)args;
		url = [[NSURL fileURLWithPath:[file path]] retain];
		[self loadLocalURL];
	}
	else
	{
		[self.proxy throwException:@"invalid datatype" subreason:[NSString stringWithFormat:@"expected a TiBlob, was: %@",[args class]] location:CODELOCATION];
	}
}

-(void)setScalesPageToFit_:(id)args
{
	// allow the user to overwrite the scale (usually if local)
	BOOL scaling = [TiUtils boolValue:args];
	scalingOverride = YES;
	[[self webview] setScalesPageToFit:scaling];
}

-(void)setDisableBounce_:(id)value
{
	BOOL bounces = ![TiUtils boolValue:value];
	[[self scrollview] setBounces:bounces];
}

-(void)setScrollsToTop_:(id)value
{
	BOOL scrollsToTop = [TiUtils boolValue:value def:YES];
	[[self scrollview] setScrollsToTop:scrollsToTop];
}

- (void)setUrl_:(id)args
{
	ignoreNextRequest = YES;
	[self setReloadData:args];
	[self setReloadDataProperties:nil];
	reloadMethod = @selector(setUrl_:);

	RELEASE_TO_NIL(url);
	RELEASE_TO_NIL(lastValidLoad);
	ENSURE_SINGLE_ARG(args,NSString);
	
	url = [[TiUtils toURL:args proxy:(TiProxy*)self.proxy] retain];

	[self stopLoading];
	
	if ([[self class] isLocalURL:url]) {
		[self loadLocalURL];
	} else {
		NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
		[self loadURLRequest:request];
		if (scalingOverride==NO) {
			[[self webview] setScalesPageToFit:YES];
		}
	}
}

-(void)setHandlePlatformUrl_:(id)arg
{
    [[self proxy] replaceValue:arg forKey:@"handlePlatformUrl" notification:NO];
    willHandleUrl = [TiUtils boolValue:arg];
}

- (void)ensureLocalProtocolHandler
{
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		[NSURLProtocol registerClass:[LocalProtocolHandler class]];
	});
}

- (void)loadLocalURL
{
	[self ensureLocalProtocolHandler];
	NSStringEncoding encoding = NSUTF8StringEncoding;
	NSString *path = [url path];
	NSString *mimeType = [Mimetypes mimeTypeForExtension:path];
	NSString *textEncodingName = @"utf-8";
	NSError *error = nil;
	NSURL *baseURL = [[url copy] autorelease];
	
	// first check to see if we're attempting to load a file from the
	// filesystem and if so, and it exists, use that
	if ([[NSFileManager defaultManager] fileExistsAtPath:path])
	{
		// per the Apple docs on what to do when you don't know the encoding ahead of a
		// file read:
		// step 1: read and attempt to have system determine
		NSString *html = [NSString stringWithContentsOfFile:path usedEncoding:&encoding error:&error];
		if (html==nil && error!=nil)
		{
			//step 2: if unknown encoding, try UTF-8
			error = nil;
			html = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:&error];
			if (html==nil && error!=nil)
			{
				//step 3: try an appropriate legacy encoding (if one) -- what's that? Latin-1?
				//at this point we're just going to fail
                //This is assuming, of course, that this just isn't a pdf or some other non-HTML file.
                if([[path pathExtension] hasPrefix:@"htm"]){
                    DebugLog(@"[ERROR] Couldn't determine the proper encoding. Make sure this file: %@ is UTF-8 encoded.",[path lastPathComponent]);                    
                }
			} else {
				// if we get here, it succeeded using UTF8
				encoding = NSUTF8StringEncoding;
				textEncodingName = @"utf-8";
			}
		} else {
			error = nil;
			textEncodingName = HTMLTextEncodingNameForStringEncoding(encoding);
			if (textEncodingName == nil) {
				DebugLog(@"[WARN] Could not determine correct text encoding for content: %@.",url);
				textEncodingName = @"utf-8";
			}
		}
		if ((error!=nil && [error code]==261) || [mimeType isEqualToString:(NSString*)svgMimeType])
		{
			//TODO: Shouldn't we be checking for an HTML mime type before trying to read? This is right now rather inefficient, but it
			//Gets the job done, with minimal reliance on extensions.
			// this is a different encoding than specified, just send it to the webview to load
			
			NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
			[self loadURLRequest:request];
			if (scalingOverride==NO) {
				[[self webview] setScalesPageToFit:YES];
			}
			return;
		} else if (error!=nil) {
			DebugLog(@"[DEBUG] Cannot load file: %@. Error message was: %@", path, error);
			RELEASE_TO_NIL(url);
			return;
		}
		[self loadFile:path encoding:encoding textEncodingName:textEncodingName mimeType:mimeType];
	} else {
		// convert it into a app:// relative path to load the resource
		// from our application
		url = [[self fileURLToAppURL:url] retain];
		NSData *data = [TiUtils loadAppResource:url];
		NSString *html = nil;
		if (data != nil) {
			html = [[[NSString alloc] initWithData:data encoding:encoding] autorelease];
		}
		if (html!=nil) {
			//Because local HTML may rely on JS that's stored in the app: schema, we must kee the url in the app: format.
			[self loadHTML:html encoding:encoding textEncodingName:textEncodingName mimeType:mimeType baseURL:baseURL];
		} else {
			NSLog(@"[WARN] couldn't load URL: %@",url);
			RELEASE_TO_NIL(url);
		}	
	}
}

-(void)setBasicAuthentication:(NSArray*)args
{
	ENSURE_ARG_COUNT(args,2);
	NSString *username = [args objectAtIndex:0];
	NSString *password = [args objectAtIndex:1];
	
	if (username==nil && password==nil)
	{
		RELEASE_TO_NIL(basicCredentials);
		return;
	}
	
	NSString *toEncode = [NSString stringWithFormat:@"%@:%@",username,password];
	const char *data = [toEncode UTF8String];
	size_t len = [toEncode length];

	char *base64Result;
    size_t theResultLength;
	bool result = Base64AllocAndEncodeData(data, len, &base64Result, &theResultLength);
	if (result)
	{
		NSData *theData = [NSData dataWithBytes:base64Result length:theResultLength];
		free(base64Result);
		NSString *string = [[[NSString alloc] initWithData:theData encoding:NSUTF8StringEncoding] autorelease];
		RELEASE_TO_NIL(basicCredentials);
		basicCredentials = [[NSString stringWithFormat:@"Basic %@",string] retain];
		if (url!=nil)
		{
			[self setUrl_:[NSArray arrayWithObject:[url absoluteString]]];
		}
	}    
}

-(NSString*)stringByEvaluatingJavaScriptFromString:(NSString *)code
{
	return [[self webview] stringByEvaluatingJavaScriptFromString:code];
}

-(CGFloat)contentHeightForWidth:(CGFloat)value
{
    CGRect oldBounds = [[self webview] bounds];
    BOOL oldVal = webview.scalesPageToFit;
    [webview setScalesPageToFit:NO];
    [webview setBounds:CGRectMake(0, 0, 10, 1)];
    CGFloat ret = [webview sizeThatFits:CGSizeMake(10, 1)].height;
    [webview setBounds:oldBounds];
    [webview setScalesPageToFit:oldVal];
    return ret;
}

-(CGFloat)contentWidthForWidth:(CGFloat)value
{
    CGRect oldBounds = [[self webview] bounds];
    BOOL oldVal = webview.scalesPageToFit;
    [webview setScalesPageToFit:NO];
    [webview setBounds:CGRectMake(0, 0, 10, 1)];
    CGFloat ret = [webview sizeThatFits:CGSizeMake(10, 1)].width;
    [webview setBounds:oldBounds];
    [webview setScalesPageToFit:oldVal];
    return ret;
}

#pragma mark WebView Delegate

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
	NSURL * newUrl = [request URL];

	if ([self.proxy _hasListeners:@"beforeload"])
	{
		NSDictionary *event = newUrl == nil ? nil : [NSDictionary dictionaryWithObjectsAndKeys:[newUrl absoluteString], @"url", NUMINT(navigationType), @"navigationType", nil];
		[self.proxy fireEvent:@"beforeload" withObject:event];
	}

	if (navigationType != UIWebViewNavigationTypeOther) {
		RELEASE_TO_NIL(lastValidLoad);
	}

	NSString * scheme = [[newUrl scheme] lowercaseString];
	if ([scheme hasPrefix:@"http"] || [scheme isEqualToString:@"ftp"]
			|| [scheme isEqualToString:@"file"] || [scheme isEqualToString:@"app"]) {
		DebugLog(@"[DEBUG] New scheme: %@",request);
        BOOL valid = !ignoreNextRequest;
        if ([scheme hasPrefix:@"http"]) {
            //UIWebViewNavigationTypeOther means we are either in a META redirect
            //or it is a js request from within the page 
            valid = valid && (navigationType != UIWebViewNavigationTypeOther);
        }
		if (valid) {
			[self setReloadData:[newUrl absoluteString]];
			[self setReloadDataProperties:nil];
			reloadMethod = @selector(setUrl_:);
		}
		if ([scheme isEqualToString:@"file"] || [scheme isEqualToString:@"app"]) {
			[NSURLProtocol setProperty:[self _tiopenchatInjection] forKey:kContentInjection inRequest:(NSMutableURLRequest *)request];
		}
		return YES;
	}
	
	UIApplication * uiApp = [UIApplication sharedApplication];
	
	if ([uiApp canOpenURL:newUrl] && !willHandleUrl)
	{
		[uiApp openURL:newUrl];
		return NO;
	}
	
	//It's likely to fail, but that way we pass it on to error handling.
	return YES;
}

- (void)webViewDidStartLoad:(UIWebView *)webView
{
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    if (spinner!=nil) {
        [UIView beginAnimations:@"webspiny" context:nil];
        [UIView setAnimationDuration:0.3];
        [spinner removeFromSuperview];
        [UIView commitAnimations];
        [spinner autorelease];
        spinner = nil;
    }
    [url release];
    url = [[[webview request] URL] retain];
    NSString* urlAbs = [url absoluteString];
    [[self proxy] replaceValue:urlAbs forKey:@"url" notification:NO];
	
    if ([self.proxy _hasListeners:@"load"]) {
        if (![urlAbs isEqualToString:lastValidLoad]) {
            NSDictionary *event = url == nil ? nil : [NSDictionary dictionaryWithObject:[self url] forKey:@"url"];
            [self.proxy fireEvent:@"load" withObject:event];
            [lastValidLoad release];
            lastValidLoad = [urlAbs retain];
        }
    }
    [webView setNeedsDisplay];
    ignoreNextRequest = NO;
    TiUIWebViewProxy * ourProxy = (TiUIWebViewProxy *)[self proxy];
    [ourProxy webviewDidFinishLoad];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error
{
	NSString *offendingUrl = [self url];

	if ([[error domain] isEqual:NSURLErrorDomain])
	{
		offendingUrl = [[error userInfo] objectForKey:NSURLErrorFailingURLStringErrorKey];

		// this means the pending request has been cancelled and should be
		// safely squashed
		if ([error code]==NSURLErrorCancelled)
		{
			return;
		}
	}

	NSLog(@"[ERROR] Error loading: %@, Error: %@",offendingUrl,error);

	if ([self.proxy _hasListeners:@"error"])
	{
		NSString * message = [TiUtils messageFromError:error];
		NSMutableDictionary *event = [NSMutableDictionary dictionaryWithObject:message forKey:@"message"];

		// We combine some error codes into a single one which we share with Android.
		NSInteger rawErrorCode = [error code];
		NSInteger returnErrorCode = rawErrorCode;

		if (rawErrorCode == NSURLErrorUserCancelledAuthentication)
		{
			returnErrorCode = NSURLErrorUserAuthenticationRequired; // URL_ERROR_AUTHENTICATION
		}
		else if (rawErrorCode == NSURLErrorNoPermissionsToReadFile || rawErrorCode == NSURLErrorCannotCreateFile || rawErrorCode == NSURLErrorFileIsDirectory || rawErrorCode == NSURLErrorCannotCloseFile || rawErrorCode == NSURLErrorCannotWriteToFile || rawErrorCode == NSURLErrorCannotRemoveFile || rawErrorCode == NSURLErrorCannotMoveFile)
		{
			returnErrorCode = NSURLErrorCannotOpenFile; // URL_ERROR_FILE
		}
		else if (rawErrorCode == NSURLErrorDNSLookupFailed)
		{
			returnErrorCode = NSURLErrorCannotFindHost; // URL_ERROR_HOST_LOOKUP
		}

		[event setObject:[NSNumber numberWithInteger:returnErrorCode] forKey:@"errorCode"];
		[event setObject:offendingUrl forKey:@"url"];
		[self.proxy fireEvent:@"error" withObject:event errorCode:returnErrorCode message:message];
	}
}

#pragma mark TiEvaluator

- (void)evalFile:(NSString*)path
{
	NSURL *url_ = [path hasPrefix:@"file:"] ? [NSURL URLWithString:path] : [NSURL fileURLWithPath:path];
	
	if (![path hasPrefix:@"/"] && ![path hasPrefix:@"file:"])
	{
		NSURL *root = [[[self proxy] _host] baseURL];
		url_ = [NSURL fileURLWithPath:[NSString stringWithFormat:@"%@/%@",root,path]];
	}
	
	NSString *code = [NSString stringWithContentsOfURL:url_ encoding:NSUTF8StringEncoding error:nil];
	[self stringByEvaluatingJavaScriptFromString:code];
}

- (void)fireEvent:(id)listener withObject:(id)obj remove:(BOOL)yn thisObject:(id)thisObject_
{
	// don't bother firing an app event to the webview if we don't have a webview yet created
	if (webview!=nil)
	{
		NSDictionary *event = (NSDictionary*)obj;
		NSString *name = [event objectForKey:@"type"];
		NSString *js = [NSString stringWithFormat:@"Ti.App._dispatchEvent('%@',%@,%@);",name,listener,[SBJSON stringify:event]];
		[webview stringByEvaluatingJavaScriptFromString:js];
	}
}

@end

@implementation LocalProtocolHandler

+ (BOOL)canInitWithRequest:(NSURLRequest *)request
{
	return [request.URL.scheme isEqualToString:@"file"];
}

+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request
{
	return request;
}

+ (BOOL)requestIsCacheEquivalent:(NSURLRequest *)a toRequest:(NSURLRequest *)b
{
	return NO;
}

- (void)startLoading
{
	id<NSURLProtocolClient> client = [self client];
    NSURLRequest *request = [self request];
	NSURL *url = [request URL];
	NSString *absolutePath = [url path];
	
	NSStringEncoding contentDataEncoding = [[[self class] propertyForKey:kContentDataEncoding inRequest:request] unsignedIntegerValue];
	if (contentDataEncoding == 0) {
		contentDataEncoding = NSUTF8StringEncoding;
	}
	NSString *contentTextEncoding = [[self class] propertyForKey:kContentTextEncoding inRequest:request];
	NSData *contentData = [[self class] propertyForKey:kContentData inRequest:request];
	if (contentData == nil) {
		contentData = [TiUtils loadAppResource:url];
		if (contentData == nil) {
			contentData = [NSData dataWithContentsOfFile:absolutePath];
			if (contentData == nil) {
				NSLog(@"[ERROR] Error loading %@", absolutePath);
				[client URLProtocol:self didFailWithError:[NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorResourceUnavailable userInfo:nil]];
				[client URLProtocolDidFinishLoading:self];
				return;
			}
		}
	}
	NSString *contentMimeType = [[self class] propertyForKey:kContentMimeType inRequest:request];
	if (contentMimeType == nil) {
		contentMimeType = [Mimetypes mimeTypeForExtension:absolutePath];
	}
	NSString *contentInjection = [[self class] propertyForKey:kContentInjection inRequest:request];
	if ((contentInjection != nil) && [contentMimeType isEqualToString:kMimeTextHTML]) {
		NSString *content = [[NSString alloc] initWithData:contentData encoding:contentDataEncoding];
		contentData = [[TiUIWebView content:content withInjection:contentInjection] dataUsingEncoding:contentDataEncoding];
		[content release];
	}
	NSURLResponse *response = [[NSURLResponse alloc] initWithURL:url MIMEType:contentMimeType expectedContentLength:[contentData length] textEncodingName:contentTextEncoding];
	[client URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed];
	[client URLProtocol:self didLoadData:contentData];
	[client URLProtocolDidFinishLoading:self];
	[response release];
}

- (void)stopLoading
{
	// NO-OP
}

@end

#endif
