/**
 * TiOpenChat APSHTTPClient Library
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import <Foundation/Foundation.h>


@interface APSHTTPHelper : NSObject

+(NSString *)base64encode:(NSData *)plainText;
+(int)caselessCompareFirstString:(const char *)firstString secondString:(const char *)secondString size:(int)size;
+(BOOL)extractEncodingFromData:(NSData *)inputData result:(NSStringEncoding *)result;
+(NSString *)contentTypeForImageData:(NSData *)data;
+(NSString *)fileMIMEType:(NSString *)file;
+(NSString *)encodeURL:(NSString *)string;
+(void)parseMimeType:(NSString **)mimeType andResponseEncoding:(NSStringEncoding *)stringEncoding fromContentType:(NSString *)contentType;
+(NSStringEncoding)parseStringEncodingFromHeaders:(NSDictionary *)headers;

@end
