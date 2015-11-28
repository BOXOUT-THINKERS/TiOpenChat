/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#if defined(USE_TI_XML) || defined(USE_TI_NETWORK)

#import "TiProxy.h"
#import "GDataXMLNode.h"

@interface TiDOMNodeListProxy : TiProxy {
@private
	NSArray *nodes;
	GDataXMLDocument* document;
}

@property(nonatomic,readonly) NSNumber *length;
-(id)item:(id)args;
-(NSNumber*)length;

-(id)_initWithPageContext:(id<TiEvaluator>)context nodes:(NSArray*)nodeList document:(GDataXMLDocument*)theDocument;

@end

#endif
