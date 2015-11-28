/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_NETWORK

#import "TiNetworkCookieProxy.h"
#import "NetworkModule.h"
#import "Reachability.h"
#import "TiApp.h"
#import "SBJSON.h"
#import "TiBlob.h"
#import "TiNetworkSocketProxy.h"
#import "TiUtils.h"

NSString* const INADDR_ANY_token = @"INADDR_ANY";
static NSOperationQueue *_operationQueue = nil;
@implementation NetworkModule

-(NSString*)apiName
{
    return @"Ti.Network";
}

-(NSString*)INADDR_ANY
{
    return INADDR_ANY_token;
}

-(NSNumber*)READ_MODE
{
    return [NSNumber numberWithInt:READ_MODE];
}

-(NSNumber*)WRITE_MODE
{
    return [NSNumber numberWithInt:WRITE_MODE];
}

-(NSNumber*)READ_WRITE_MODE
{
    return [NSNumber numberWithInt:READ_WRITE_MODE];
}

-(void)shutdown:(id)sender
{
    RELEASE_TO_NIL(_operationQueue);
    [super shutdown:sender];
}
-(void)startReachability
{
	NSAssert([NSThread currentThread],@"not on the main thread for startReachability");
	// reachability runs on the current run loop so we need to make sure we're
	// on the main UI thread
	reachability = [[Reachability reachabilityForInternetConnection] retain];
    [reachability startNotifier];
	[self updateReachabilityStatus];
}

-(void)stopReachability
{
	NSAssert([NSThread currentThread],@"not on the main thread for stopReachability");
	[reachability stopNotifier];
	RELEASE_TO_NIL(reachability);
}

-(void)_configure
{
	[super _configure];
	// default to unknown network type on startup until reachability has figured it out
	state = TiNetworkConnectionStateUnknown; 
	WARN_IF_BACKGROUND_THREAD_OBJ;	//NSNotificationCenter is not threadsafe!
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(reachabilityChanged:) name:kReachabilityChangedNotification object:nil];
	// wait until done is important to get the right state
	TiThreadPerformOnMainThread(^{[self startReachability];}, YES);
}

-(void)_destroy
{
	TiThreadPerformOnMainThread(^{[self stopReachability];}, YES);
	WARN_IF_BACKGROUND_THREAD_OBJ;	//NSNotificationCenter is not threadsafe!
	[[NSNotificationCenter defaultCenter] removeObserver:self name:kReachabilityChangedNotification object:nil];
	RELEASE_TO_NIL(pushNotificationCallback);
	RELEASE_TO_NIL(pushNotificationError);
	RELEASE_TO_NIL(pushNotificationSuccess);
    [self forgetProxy:socketProxy];
    RELEASE_TO_NIL(socketProxy);
	[super _destroy];
}

-(void)updateReachabilityStatus
{
	NetworkStatus status = [reachability currentReachabilityStatus];
	switch(status)
	{
		case NotReachable:
		{
			state = TiNetworkConnectionStateNone;
			break;
		}
		case ReachableViaWiFi:
		{
			state = TiNetworkConnectionStateWifi;
			break;
		}
		case ReachableViaWWAN:
		{
			state = TiNetworkConnectionStateMobile;
			break;
		}
		default:
		{
			state = TiNetworkConnectionStateUnknown;
			break;
		}
	}
	if ([self _hasListeners:@"change"])
	{
		NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:
							   [self networkType], @"networkType",
							   [self online], @"online",
							   [self networkTypeName], @"networkTypeName",
							   nil];
		[self fireEvent:@"change" withObject:event];
	}
}

-(void)reachabilityChanged:(NSNotification*)note
{
	[self updateReachabilityStatus];
}

-(id)encodeURIComponent:(id)args
{
	id arg = [args objectAtIndex:0];
	NSString *unencodedString = [TiUtils stringValue:arg];
	return [(NSString *)CFURLCreateStringByAddingPercentEscapes(NULL,
								(CFStringRef)unencodedString,
								NULL,
								(CFStringRef)@"!*'();:@+$,/?%#[]=&",
								kCFStringEncodingUTF8) autorelease];
}

-(id)decodeURIComponent:(id)args
{
	id arg = [args objectAtIndex:0];
	NSString *encodedString = [TiUtils stringValue:arg];
	return [(NSString *)CFURLCreateStringByReplacingPercentEscapesUsingEncoding(NULL, (CFStringRef)encodedString, CFSTR(""), kCFStringEncodingUTF8) autorelease];
}

// Socket submodule
#ifdef USE_TI_NETWORKSOCKET
-(TiProxy*)Socket
{
    if (socketProxy == nil) {
        socketProxy = [[TiNetworkSocketProxy alloc] _initWithPageContext:[self pageContext]];
        [self rememberProxy:socketProxy];
    }
    return socketProxy;
}
#endif

- (NSNumber*)online
{
	if (state!=TiNetworkConnectionStateNone && state!=TiNetworkConnectionStateUnknown)
	{
		return NUMBOOL(YES);
	}
	return NUMBOOL(NO);
}

- (NSString*)networkTypeName
{
	switch(state)
	{
		case TiNetworkConnectionStateNone:
			return @"NONE";
		case TiNetworkConnectionStateWifi:
			return @"WIFI";
		case TiNetworkConnectionStateLan:
			return @"LAN";
		case TiNetworkConnectionStateMobile:
			return @"MOBILE";
		default: {
			break;
		}
	}
	return @"UNKNOWN";
}

-(NSNumber*)networkType
{
	return NUMINT(state);
}

MAKE_SYSTEM_PROP(NETWORK_NONE,TiNetworkConnectionStateNone);
MAKE_SYSTEM_PROP(NETWORK_WIFI,TiNetworkConnectionStateWifi);
MAKE_SYSTEM_PROP(NETWORK_MOBILE,TiNetworkConnectionStateMobile);
MAKE_SYSTEM_PROP(NETWORK_LAN,TiNetworkConnectionStateLan);
MAKE_SYSTEM_PROP(NETWORK_UNKNOWN,TiNetworkConnectionStateUnknown);

MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_BADGE,1);
MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_ALERT,2);
MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_SOUND,3);
MAKE_SYSTEM_PROP(NOTIFICATION_TYPE_NEWSSTAND, 4);

MAKE_SYSTEM_PROP(TLS_VERSION_1_0, TLS_VERSION_1_0);
MAKE_SYSTEM_PROP(TLS_VERSION_1_1, TLS_VERSION_1_1);
MAKE_SYSTEM_PROP(TLS_VERSION_1_2, TLS_VERSION_1_2);

MAKE_SYSTEM_NUMBER(PROGRESS_UNKNOWN, NUMINT(-1));

#pragma mark Push Notifications 

- (NSString*) remoteDeviceUUID
{
	return [[TiApp app] remoteDeviceUUID];
}

- (NSNumber*)remoteNotificationsEnabled
{
    // enableRemoteNotificationTypes deprecated in iOS 8.0
    if (![TiUtils isIOS8OrGreater]) {
        __block UIRemoteNotificationType types;
        TiThreadPerformOnMainThread(^{
            types = [[UIApplication sharedApplication] enabledRemoteNotificationTypes];
        }, YES);
        return NUMBOOL(types != UIRemoteNotificationTypeNone);
    }
    
    __block BOOL enabled;
    TiThreadPerformOnMainThread(^{
        enabled = [[UIApplication sharedApplication] isRegisteredForRemoteNotifications];
    }, YES);
    return NUMBOOL(enabled);
}

- (NSArray*)remoteNotificationTypes
{
    __block NSUInteger types;
    NSMutableArray *result = [NSMutableArray array];
    if ([TiUtils isIOS8OrGreater]) {
        TiThreadPerformOnMainThread(^{
            types = [[[UIApplication sharedApplication] currentUserNotificationSettings] types];
        }, YES);
        if ((types & UIUserNotificationTypeBadge)!=0)
        {
            [result addObject:NUMINT(1)];
        }
        if ((types & UIUserNotificationTypeAlert)!=0)
        {
            [result addObject:NUMINT(2)];
        }
        if ((types & UIUserNotificationTypeSound)!=0)
        {
            [result addObject:NUMINT(3)];
        }
    } else {
        TiThreadPerformOnMainThread(^{
            types = [[UIApplication sharedApplication] enabledRemoteNotificationTypes];
        }, YES);
        if ((types & UIRemoteNotificationTypeBadge)!=0)
        {
            [result addObject:NUMINT(1)];
        }
        if ((types & UIRemoteNotificationTypeAlert)!=0)
        {
            [result addObject:NUMINT(2)];
        }
        if ((types & UIRemoteNotificationTypeSound)!=0)
        {
            [result addObject:NUMINT(3)];
        }
        if ((types & UIRemoteNotificationTypeNewsstandContentAvailability)!=0)
        {
            [result addObject:NUMINT(4)];
        }
    }
    return result;
}

-(void)registerForPushNotifications:(id)args
{
	ENSURE_SINGLE_ARG(args,NSDictionary);
    ENSURE_UI_THREAD(registerForPushNotifications, args);
	
	RELEASE_TO_NIL(pushNotificationCallback);
	RELEASE_TO_NIL(pushNotificationError);
	RELEASE_TO_NIL(pushNotificationSuccess);
	
	pushNotificationSuccess = [[args objectForKey:@"success"] retain];
	pushNotificationError = [[args objectForKey:@"error"] retain];
	pushNotificationCallback = [[args objectForKey:@"callback"] retain];
	
	[[TiApp app] setRemoteNotificationDelegate:self];
    
    UIApplication * app = [UIApplication sharedApplication];
    
	//for iOS8 or greater only
	//Note adviced to register user notification settings in Ti.App.iOS first before register for remote notifications
	if([TiUtils isIOS8OrGreater]) {
        [app registerForRemoteNotifications];
        
        if ([args objectForKey:@"types"] != nil) {
            NSLog(@"[WARN] Passing `types` to registerForPushNotifications is not supported on iOS 8 and greater. Use registerUserNotificationSettings to register notification types.");
        }
	}
	else {
        UIRemoteNotificationType ourNotifications = [app enabledRemoteNotificationTypes];
        
        NSArray *typesRequested;
        ENSURE_ARG_OR_NIL_FOR_KEY(typesRequested, args, @"types", NSArray);
        if (typesRequested != nil)
        {
            for (id thisTypeRequested in typesRequested)
            {
                NSInteger value = [TiUtils intValue:thisTypeRequested];
                switch(value)
                {
                    case 1: // NOTIFICATION_TYPE_BADGE
                    {
                        ourNotifications |= UIRemoteNotificationTypeBadge;
                        break;
                    }
                    case 2: // NOTIFICATION_TYPE_ALERT
                    {
                        ourNotifications |= UIRemoteNotificationTypeAlert;
                        break;
                    }
                    case 3: // NOTIFICATION_TYPE_SOUND
                    {
                        ourNotifications |= UIRemoteNotificationTypeSound;
                        break;
                    }
                    case 4: // NOTIFICATION_TYPE_NEWSSTAND
                    {
                        ourNotifications |= UIRemoteNotificationTypeNewsstandContentAvailability;
                        break;
                    }
                }
            }
        }
        
        [app registerForRemoteNotificationTypes:ourNotifications];
	}
	// check to see upon registration if we were started with a push
	// notification and if so, go ahead and trigger our callback
	id currentNotification = [[TiApp app] remoteNotification];
	if (currentNotification!=nil && pushNotificationCallback!=nil)
	{
		NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
		[event setObject:currentNotification forKey:@"data"];
		[event setObject:NUMBOOL(YES) forKey:@"inBackground"];
		[self _fireEventToListener:@"remote" withObject:event listener:pushNotificationCallback thisObject:nil];
	}
}

-(void)unregisterForPushNotifications:(id)args
{
	UIApplication * app = [UIApplication sharedApplication];
	[app unregisterForRemoteNotifications];
}

#pragma mark Push Notification Delegates

#ifdef USE_TI_NETWORKREGISTERFORPUSHNOTIFICATIONS

-(void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
	// called by TiApp
	if (pushNotificationSuccess!=nil)
	{
		NSString *token = [[[[deviceToken description] stringByReplacingOccurrencesOfString:@"<"withString:@""]
							stringByReplacingOccurrencesOfString:@">" withString:@""] 
						   stringByReplacingOccurrencesOfString: @" " withString: @""];
		NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
		[event setObject:token forKey:@"deviceToken"];
		[self _fireEventToListener:@"remote" withObject:event listener:pushNotificationSuccess thisObject:nil];
	}
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
{
	// called by TiApp
	if (pushNotificationCallback!=nil)
	{
		NSMutableDictionary * event = [TiUtils dictionaryWithCode:0 message:nil];
		[event setObject:userInfo forKey:@"data"];
		BOOL inBackground = (application.applicationState != UIApplicationStateActive);
		[event setObject:NUMBOOL(inBackground) forKey:@"inBackground"];
		[self _fireEventToListener:@"remote" withObject:event listener:pushNotificationCallback thisObject:nil];
	}
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
	// called by TiApp
	if (pushNotificationError!=nil)
	{
		NSString * message = [TiUtils messageFromError:error];
		NSMutableDictionary * event = [TiUtils dictionaryWithCode:[error code] message:message];
		[self _fireEventToListener:@"remote" withObject:event listener:pushNotificationError thisObject:nil];
	}
}

#endif

#pragma mark Cookies

-(id<TiEvaluator>)evaluationContext
{
	id<TiEvaluator> context = [self executionContext];
	if(context == nil) {
		context = [self pageContext];
	}
	return context;
}

-(NSArray*)getHTTPCookiesForDomain:(id)args
{
    ENSURE_SINGLE_ARG(args, NSString);
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSMutableArray *allCookies = [NSMutableArray array];
    for(NSHTTPCookie* cookie in [storage cookies])
    {
        if([[cookie domain] isEqualToString: args])
        {
            [allCookies addObject:cookie];
        }
    }
    NSMutableArray *returnArray = [NSMutableArray array];
    for(NSHTTPCookie *cookie in allCookies)
    {
        [returnArray addObject:[[[TiNetworkCookieProxy alloc] initWithCookie:cookie andPageContext:[self evaluationContext]] autorelease]];
    }
    return returnArray;
}

-(void)addHTTPCookie:(id)args;
{
    ENSURE_SINGLE_ARG(args, TiNetworkCookieProxy);
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSHTTPCookie* cookie = [args newCookie];
    if(cookie != nil)
    {
        [storage setCookie:cookie];
    }
	RELEASE_TO_NIL(cookie);
}

-(NSArray*)getHTTPCookies:(id)args
{
    NSString* domain = [TiUtils stringValue:[args objectAtIndex:0]];
    NSString*   path = [TiUtils stringValue:[args objectAtIndex:1]];
    NSString*   name = [TiUtils stringValue:[args objectAtIndex:2]];
    if (path == nil || [path isEqual:@""]) {
        path = @"/";
    }
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    
    NSArray *allCookies = [storage cookies];
    NSMutableArray *returnArray = [NSMutableArray array];
    for(NSHTTPCookie *cookie in allCookies)
    {
        if([[cookie domain] isEqualToString:domain] &&
           [[cookie path] isEqualToString:path] &&
           ([[cookie name] isEqualToString:name] || name == nil)) {
			TiNetworkCookieProxy *tempCookieProxy = [[TiNetworkCookieProxy alloc] initWithCookie:cookie andPageContext:[self evaluationContext]];
            [returnArray addObject:tempCookieProxy];
			RELEASE_TO_NIL(tempCookieProxy);
        }
    }
    return returnArray;
}

-(void)removeAllHTTPCookies:(id)args
{
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    while ([[storage cookies] count] > 0) {
        [storage deleteCookie: [[storage cookies] objectAtIndex:0]];
    }
}

-(void)removeHTTPCookie:(id)args
{
    NSArray* cookies = [self getHTTPCookies:args];
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for(TiNetworkCookieProxy* cookie in cookies) {
		NSHTTPCookie *tempCookie = [cookie newCookie];
        [storage deleteCookie: tempCookie];
		RELEASE_TO_NIL(tempCookie);
    }
}

-(void)removeHTTPCookiesForDomain:(id)args
{
    NSArray* cookies = [self getHTTPCookiesForDomain:args];
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for(TiNetworkCookieProxy* cookie in cookies) {
		NSHTTPCookie *tempCookie = [cookie newCookie];
        [storage deleteCookie: tempCookie];
		RELEASE_TO_NIL(tempCookie);
    }
}

-(NSArray*)allHTTPCookies
{
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSMutableArray *array = [NSMutableArray array];
    for(NSHTTPCookie* cookie in [storage cookies])
    {
        [array addObject:[[[TiNetworkCookieProxy alloc] initWithCookie:cookie andPageContext:[self evaluationContext]] autorelease]];
    }
    return array;
}

+(NSOperationQueue*)operationQueue;
{
    if(_operationQueue == nil) {
        _operationQueue = [[NSOperationQueue alloc] init];
        [_operationQueue setMaxConcurrentOperationCount:4];
    }
    return _operationQueue;
}
@end


#endif
