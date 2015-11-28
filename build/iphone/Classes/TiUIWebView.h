/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIWEBVIEW

#import "TiUIView.h"


@interface TiUIWebView : TiUIView<UIWebViewDelegate> {
@private
	UIWebView *webview;
	UIActivityIndicatorView *spinner;
	NSURL *url;
	NSMutableDictionary *listeners;
	NSString *pageToken;
	BOOL scalingOverride;
	NSString *basicCredentials;
	
	//TODO: make more elegant
	BOOL ignoreNextRequest;
	id reloadData;
    id reloadDataProperties;
	SEL reloadMethod;
    
    BOOL willHandleTouches;
    BOOL willHandleUrl;
    NSString* lastValidLoad;
}

@property(nonatomic,readonly) id url;
@property(nonatomic,readwrite,retain) id reloadData;
@property(nonatomic,readwrite,retain) id reloadDataProperties;

-(void)evalFile:(NSString*)path;
-(NSString*)stringByEvaluatingJavaScriptFromString:(NSString *)code;
-(void)fireEvent:(id)listener withObject:(id)obj remove:(BOOL)yn thisObject:(id)thisObject_;

-(void)stopLoading;
-(void)goBack;
-(void)goForward;
-(BOOL)isLoading;
-(BOOL)canGoBack;
-(BOOL)canGoForward;
-(void)reload;

-(void)setHtml_:(NSString*)content withObject:(id)property;

@end

#endif
