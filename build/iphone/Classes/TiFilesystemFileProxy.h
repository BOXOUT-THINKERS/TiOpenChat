/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#if defined(USE_TI_FILESYSTEM) || defined(USE_TI_DATABASE) || defined(USE_TI_MEDIA)

#import "TiFile.h"

@class TiFilesystemFileStreamProxy;

@interface TiFilesystemFileProxy : TiFile {
@private
	NSFileManager *fm;
}

-(id)initWithFile:(NSString*)path;

-(TiFilesystemFileStreamProxy *) open:(id) args;

+(id)makeTemp:(BOOL)isDirectory;

@property(nonatomic,readonly) id name;
@property(nonatomic,readonly) id nativePath;
@property(nonatomic,readonly) id readonly;
@property(nonatomic,readonly) id writable;
@property(nonatomic,readonly) id symbolicLink;
@property(nonatomic,readonly) id executable;
@property(nonatomic,readonly) id hidden;

@property(nonatomic,readwrite,assign) NSNumber* remoteBackup;


@end

#endif
