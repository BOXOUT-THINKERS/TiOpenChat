/**
 * TiOpenChat APSHTTPClient Library
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#ifndef DebugLog
#if defined(DEBUG) || defined(DEVELOPER)
#define DebugLog(...) { NSLog(__VA_ARGS__); }
#else
#define DebugLog(...) {}
#endif
#endif

#import "APSHTTPRequest.h"
#import "APSHTTPResponse.h"
#import "APSHTTPPostForm.h"
#import "APSHTTPHelper.h"
