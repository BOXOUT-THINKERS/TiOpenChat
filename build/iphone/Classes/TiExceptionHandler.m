/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#include <execinfo.h>
#import "TiExceptionHandler.h"
#import "TiBase.h"
#import "TiApp.h"

static void TiUncaughtExceptionHandler(NSException *exception);

static NSUncaughtExceptionHandler *prevUncaughtExceptionHandler = NULL;

@implementation TiExceptionHandler

@synthesize delegate = _delegate;

+ (TiExceptionHandler *)defaultExceptionHandler
{
	static TiExceptionHandler *defaultExceptionHandler;
	static dispatch_once_t onceToken;
	dispatch_once(&onceToken, ^{
		defaultExceptionHandler = [[self alloc] init];
		prevUncaughtExceptionHandler = NSGetUncaughtExceptionHandler();
		NSSetUncaughtExceptionHandler(&TiUncaughtExceptionHandler);
	});
	return defaultExceptionHandler;
}

- (void)reportException:(NSException *)exception withStackTrace:(NSArray *)stackTrace
{
	NSString *message = [NSString stringWithFormat:
				@"[ERROR] The application has crashed with an uncaught exception '%@'.\nReason:\n%@\nStack trace:\n\n%@\n",
				exception.name, exception.reason, [stackTrace componentsJoinedByString:@"\n"]];
	NSLog(@"%@",message);
	id <TiExceptionHandlerDelegate> currentDelegate = _delegate;
	if (currentDelegate == nil) {
		currentDelegate = self;
	}
	[currentDelegate handleUncaughtException:exception withStackTrace:stackTrace];
}

- (void)reportScriptError:(TiScriptError *)scriptError
{
	DebugLog(@"[ERROR] Script Error %@", [scriptError detailedDescription]);
	
	id <TiExceptionHandlerDelegate> currentDelegate = _delegate;
	if (currentDelegate == nil) {
		currentDelegate = self;
	}
	[currentDelegate handleScriptError:scriptError];
}

- (void)showScriptError:(TiScriptError *)error
{
	[[TiApp app] showModalError:[error description]];
	[[NSNotificationCenter defaultCenter] postNotificationName:kTiErrorNotification
	                                                    object:self
	                                                  userInfo:error.dictionaryValue];
}

#pragma mark - TiExceptionHandlerDelegate

- (void)handleUncaughtException:(NSException *)exception withStackTrace:(NSArray *)stackTrace
{
}

- (void)handleScriptError:(TiScriptError *)error
{
	[self showScriptError:error];
}

@end

@implementation TiScriptError

@synthesize message = _message;
@synthesize sourceURL = _sourceURL;
@synthesize lineNo = _lineNo;
@synthesize dictionaryValue = _dictionaryValue;
@synthesize backtrace = _backtrace;

- (id)initWithMessage:(NSString *)message sourceURL:(NSString *)sourceURL lineNo:(NSInteger)lineNo
{
    self = [super init];
    if (self) {
		_message = [message copy];
		_sourceURL = [sourceURL copy];
		_lineNo = lineNo;
    }
    return self;
}

- (id)initWithDictionary:(NSDictionary *)dictionary
{
    NSString *message = [[dictionary objectForKey:@"message"] description];
    if (message == nil) {
        message = [[dictionary objectForKey:@"nativeReason"] description];
    }
    NSString *sourceURL = [[dictionary objectForKey:@"sourceURL"] description];
    NSInteger lineNo = [[dictionary objectForKey:@"line"] integerValue];

    self = [self initWithMessage:message sourceURL:sourceURL lineNo:lineNo];
    if (self) {
        _backtrace = [[[dictionary objectForKey:@"backtrace"] description] copy];
        if (_backtrace == nil) {
            _backtrace = [[[dictionary objectForKey:@"stack"] description] copy];
        }
        _dictionaryValue = [dictionary copy];
    }
    return self;
}

- (void)dealloc
{
	RELEASE_TO_NIL(_message);
	RELEASE_TO_NIL(_sourceURL);
	RELEASE_TO_NIL(_backtrace);
	RELEASE_TO_NIL(_dictionaryValue);
    [super dealloc];
}

- (NSString *)description
{
	if (self.sourceURL != nil) {
		return [NSString stringWithFormat:@"%@ at %@ (line %ld)", self.message,[self.sourceURL lastPathComponent], (long)self.lineNo];
	} else {
		return [NSString stringWithFormat:@"%@", self.message];
	}
}

- (NSString *)detailedDescription
{
	return _dictionaryValue != nil ? [_dictionaryValue description] : [self description];
}

@end

//
// thanks to: http://www.restoroot.com/Blog/2008/10/18/crash-reporter-for-iphone-applications/
//
static void TiUncaughtExceptionHandler(NSException *exception)
{
	static BOOL insideException = NO;
	
	// prevent recursive exceptions
	if (insideException==YES) {
		exit(1);
		return;
	}
	insideException = YES;
	
    NSArray *callStackArray = [exception callStackReturnAddresses];
    int frameCount = (int)[callStackArray count];
    void *backtraceFrames[frameCount];
	
    for (int i = 0; i < frameCount; ++i) {
        backtraceFrames[i] = (void *)[[callStackArray objectAtIndex:i] unsignedIntegerValue];
    }
	char **frameStrings = backtrace_symbols(&backtraceFrames[0], frameCount);
	
	NSMutableArray *stack = [[NSMutableArray alloc] initWithCapacity:frameCount];
	if (frameStrings != NULL) {
		for (int i = 0; (i < frameCount) && (frameStrings[i] != NULL); ++i) {
			[stack addObject:[NSString stringWithCString:frameStrings[i] encoding:NSASCIIStringEncoding]];
		}
		free(frameStrings);
	}
	
	[[TiExceptionHandler defaultExceptionHandler] reportException:exception withStackTrace:[[stack copy] autorelease]];
	[stack release];
	
	insideException=NO;
	if (prevUncaughtExceptionHandler != NULL) {
		prevUncaughtExceptionHandler(exception);
	}
}
