/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#if defined(USE_TI_XML) || defined(USE_TI_NETWORK)
#import "TiDOMPIProxy.h"
#import "TiBase.h"
// Corresponds to Interface ProcessingInstruction of DOM2 Spec.
@implementation TiDOMPIProxy

-(NSString*)apiName
{
    return @"Ti.XML.ProcessingInstruction";
}

-(NSString *)data
{
	return [node stringValue];
}

-(void)setData:(NSString *)data
{
	ENSURE_TYPE(data, NSString);
	[node setStringValue:data];
}

-(void)setNodeValue:(NSString *)data
{
	[self setData:data];
}

-(NSString*)target
{
    return [node name];
}


@end
#endif