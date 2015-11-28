/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import <UIKit/UIKit.h>

#import "TiHost.h"
#import "KrollBridge.h"
#ifdef USE_TI_UIWEBVIEW
	#import "XHRBridge.h"
#endif
#import "TiRootViewController.h"
#import "TiToJS.h"

extern BOOL applicationInMemoryPanic;

TI_INLINE void waitForMemoryPanicCleared()   //WARNING: This must never be run on main thread, or else there is a risk of deadlock!
{
    while (applicationInMemoryPanic) {
        [NSThread sleepForTimeInterval:0.01];
    }
}

/**
 TiApp represents an instance of an application. There is always only one instance per application which could be accessed through <app> class method.
 @see app
 */
@interface TiApp : TiHost <UIApplicationDelegate, NSURLSessionDelegate, NSURLSessionTaskDelegate, NSURLSessionDownloadDelegate>
{
	UIWindow *window;
	UIImageView *loadView;
	UIImageView *splashScreenImage;
	BOOL loaded;

	TiContextGroupRef contextGroup;
	KrollBridge *kjsBridge;
    
#ifdef USE_TI_UIWEBVIEW
	XHRBridge *xhrBridge;
#endif
	
	NSMutableDictionary *launchOptions;
	NSTimeInterval started;
	
	int32_t networkActivityCount;
	
	TiRootViewController *controller;
	NSString *userAgent;
	NSString *remoteDeviceUUID;
	
	id remoteNotificationDelegate;
	NSDictionary* remoteNotification;
	NSMutableDictionary* pendingCompletionHandlers;
    NSMutableDictionary* pendingReplyHandlers;
    NSMutableDictionary* backgroundTransferCompletionHandlers;
    BOOL appBooted;
    
	NSString *sessionId;

	UIBackgroundTaskIdentifier bgTask;
	NSMutableArray *backgroundServices;
	NSMutableArray *runningServices;
	NSDictionary *localNotification;
#if IS_XCODE_7
    UIApplicationShortcutItem *launchedShortcutItem;
#endif
}

@property (nonatomic) BOOL forceSplashAsSnapshot;

/**
 Returns application's primary window.
 
 Convenience method to access the application's primary window
 */
@property (nonatomic, retain) IBOutlet UIWindow *window;

@property (nonatomic, assign) id remoteNotificationDelegate;


@property (nonatomic, readonly) NSMutableDictionary* pendingCompletionHandlers;
@property (nonatomic, readonly) NSMutableDictionary* backgroundTransferCompletionHandlers;

/**
 Returns details for the last remote notification.
 
 Dictionary containing details about remote notification, or _nil_.
 */
@property (nonatomic, readonly) NSDictionary* remoteNotification;

/**
 Returns local notification that has bees sent on the application.
 
 @return Dictionary containing details about local notification, or _nil_.
 */

@property (nonatomic, readonly) NSDictionary* localNotification;

/**
 Returns the application's root view controller.
 */
@property (nonatomic, retain) TiRootViewController* controller;

@property (nonatomic, readonly) TiContextGroupRef contextGroup;

/**
 Returns singleton instance of TiApp application object.
 */
+(TiApp*)app;

/**
 * Returns a read-only dictionary from tiapp.xml properties
 */
+(NSDictionary *)tiAppProperties;

/*
 Convenience method to returns root view controller for TiApp instance.
 @return The application's root view controller.
 @see controller
 */
+(TiRootViewController*)controller;

+(TiContextGroupRef)contextGroup;

-(BOOL)windowIsKeyWindow;

-(UIView *) topMostView;

-(void)attachXHRBridgeIfRequired;

/**
 Returns application launch options
 
 The method provides access to application launch options that became available when application just launched.
 @return The launch options dictionary.
 */
-(NSDictionary*)launchOptions;

/**
 Returns remote UUID for the current running device.
 
 @return Current device UUID.
 */
-(NSString*)remoteDeviceUUID;

/**
 Tells application to show network activity indicator.
 
 Every call of startNetwork should be paired with <stopNetwork>.
 @see stopNetwork
 */
-(void)startNetwork;

/**
 Tells application to hide network activity indicator.
 
 Every call of stopNetwork should have corresponding <startNetwork> call.
 @see startNetwork
 */
-(void)stopNetwork;

/**
 Prevents network activity indicator from showing.
 Setting this property to YES disables appearance of network activity indicator when startNetwork is called.
 In case network activity indicator is currently visible, it will be hidden.
 @see startNetwork
 @see stopNetwork
 */
@property (nonatomic, assign) BOOL disableNetworkActivityIndicator;

-(void)showModalError:(NSString*)message;

/**
 Tells application to display modal view controller.
 
 @param controller The view controller to display.
 @param animated If _YES_, animates the view controller as it’s presented; otherwise, does not.
 */
-(void)showModalController:(UIViewController*)controller animated:(BOOL)animated;

/**
 Tells application to hide modal view controller.
 
 @param controller The view controller to hide.
 @param animated If _YES_, animates the view controller as it’s hidden; otherwise, does not.
 */
-(void)hideModalController:(UIViewController*)controller animated:(BOOL)animated;

/**
 Returns user agent string to use for network requests.
 
 @return User agent string
 */
-(NSString*)userAgent;

/**
 Returns unique identifier for the current application launch.
 
 @return Current session id.
 */
-(NSString*)sessionId;

-(void)beginBackgrounding;
-(void)endBackgrounding;

@property(nonatomic,readonly) BOOL appBooted;

-(void)registerBackgroundService:(TiProxy*)proxy;
-(void)unregisterBackgroundService:(TiProxy*)proxy;
-(void)stopBackgroundService:(TiProxy*)proxy;
-(void)completionHandler:(id)key withResult:(int)result;
-(void)completionHandlerForBackgroundTransfer:(id)key;
-(void)watchKitExtensionRequestHandler:(id)key withUserInfo:(NSDictionary*)userInfo;
@end

