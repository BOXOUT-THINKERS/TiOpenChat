/**
 * TiOpenChat APSHTTPClient Library
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, APSRequestError) {
    APSRequestErrorCancel = 0,
    APSRequestErrorConnectionDelegateFailed = -1
};


@class APSHTTPResponse;
@class APSHTTPRequest;
@class APSHTTPPostForm;

@protocol APSConnectionDelegate <NSURLConnectionDelegate, NSURLSessionDelegate, NSURLSessionDataDelegate>
@optional
-(BOOL)willHandleChallenge:(NSURLAuthenticationChallenge *)challenge forConnection:(NSURLConnection *)connection;
@end

@protocol APSHTTPRequestDelegate <NSObject>
@optional
-(void)request:(APSHTTPRequest*)request onLoad:(APSHTTPResponse*)response;
-(void)request:(APSHTTPRequest*)request onError:(APSHTTPResponse*)response;
-(void)request:(APSHTTPRequest*)request onDataStream:(APSHTTPResponse*)response;
-(void)request:(APSHTTPRequest*)request onSendStream:(APSHTTPResponse*)response;
-(void)request:(APSHTTPRequest*)request onReadyStateChange:(APSHTTPResponse*)response;
-(void)request:(APSHTTPRequest*)request onRedirect:(APSHTTPResponse*)response;

@end

@interface APSHTTPRequest : NSObject

@property(nonatomic, strong, readwrite) NSURL                            *url;
@property(nonatomic, strong, readwrite) NSString                         *method;
@property(nonatomic, strong, readwrite) NSString                         *filePath;
@property(nonatomic, strong, readwrite) NSString                         *requestUsername;
@property(nonatomic, strong, readwrite) NSString                         *requestPassword;
@property(nonatomic, strong, readwrite) APSHTTPPostForm                  *postForm;
@property(nonatomic, strong, readonly ) APSHTTPResponse                  *response;
@property(nonatomic, weak,   readwrite) NSObject<APSHTTPRequestDelegate> *delegate;
@property(nonatomic, weak,   readwrite) NSObject<APSConnectionDelegate>  *connectionDelegate;
@property(nonatomic, assign, readwrite) NSTimeInterval                   timeout;
@property(nonatomic, assign, readwrite) BOOL                             sendDefaultCookies;
@property(nonatomic, assign, readwrite) BOOL                             redirects;
@property(nonatomic, assign, readwrite) BOOL                             validatesSecureCertificate;
@property(nonatomic, assign, readwrite) BOOL                             cancelled;
@property(nonatomic, assign, readwrite) NSURLRequestCachePolicy          cachePolicy;

/*!
 @discussion Set to YES to block the caller's thread for the duration
 of the network call. In this case the queue property is ignored. The
 default value is NO.
 */
@property(nonatomic, assign, readwrite) BOOL                             synchronous;

/*!
 @discussion An optional NSOperationQueue for delegate callbacks.
 The default value is nil, which means delegate callbakcs occur on
 the caller's thread if the synchronous property is NO. If the 
 synchronous property is YES then this property is ignored.
 */
@property(nonatomic, strong, readwrite) NSOperationQueue                 *theQueue;

/*!
 @discussion An optioanl array of run loop modes for delegate calllbacks
 on the run loop of the caller's thread. The default is one element 
 array containing NSDefaultRunLoopMode. This is an advanced property,
 and is ignored if synchronous is YES or theQueue is not nil. It is
 the caller's responsibility to keep the thread and the run loop alive.
 */
@property(nonatomic, strong, readwrite) NSArray                          *runModes;

// Only used in TiOpenChat ImageLoader
@property(nonatomic, strong, readwrite) NSDictionary                     *userInfo;

-(void)send;
-(void)abort;
-(void)addRequestHeader:(NSString*)key value:(NSString*)value;
@end
