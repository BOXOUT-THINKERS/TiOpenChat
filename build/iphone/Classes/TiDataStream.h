/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import <Foundation/Foundation.h>
#import "TiStreamProxy.h"

// Generic stream for data; designed to encapsulate blobs and buffers.
@interface TiDataStream : TiStreamProxy<TiStreamInternal> {
    NSData* data;
    TiStreamMode mode;
    NSUInteger position;
}
@property (nonatomic) TiStreamMode mode;
@property (nonatomic,readwrite,retain) NSData* data;

@end
