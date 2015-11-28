/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import "TiBlob.h"
#import "Mimetypes.h"
#import "TiUtils.h"
#import "UIImage+Alpha.h"
#import "UIImage+Resize.h"
#import "UIImage+RoundedCorner.h"

//NOTE:FilesystemFile is conditionally compiled based on the filesystem module.
#import "TiFilesystemFileProxy.h"

static NSString *const MIMETYPE_PNG = @"image/png";
static NSString *const MIMETYPE_JPEG = @"image/jpeg";

@implementation TiBlob

-(void)dealloc
{
	RELEASE_TO_NIL(mimetype);
	RELEASE_TO_NIL(data);
	RELEASE_TO_NIL(image);
	RELEASE_TO_NIL(path);
	[super dealloc];
}

-(id)description
{
	NSString* text = [self text];
	if (text == nil || [text isEqualToString:@""]) {
		return @"[object TiBlob]";
	}
	return text;
}

-(NSString*)apiName
{
    return @"Ti.Blob";
}


-(void)ensureImageLoaded
{
    if (image == nil && !imageLoadAttempted) {
        imageLoadAttempted = YES;
        switch(type)
        {
            case TiBlobTypeFile:
            {
                image = [[UIImage imageWithContentsOfFile:path] retain];
                break;
            }
            case TiBlobTypeData:
            {
                image = [[UIImage imageWithData:data] retain];
                break;
            }
            default: {
                break;
            }
        }
    }
}

-(NSInteger)width
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		return image.size.width;
	}
	return 0;
}

-(NSInteger)height
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		return image.size.height;
	}
	return 0;
}

-(NSInteger)size
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		return image.size.width * image.size.height;
	}
	switch (type)
	{
		case TiBlobTypeData:
		{
			return [data length];
		}
		case TiBlobTypeFile:
		{
			NSFileManager *fm = [NSFileManager defaultManager];
			NSError *error = nil; 
			NSDictionary * resultDict = [fm attributesOfItemAtPath:path error:&error];
			id result = [resultDict objectForKey:NSFileSize];
			if (error!=NULL)
			{
				return 0;
			}
			return [result intValue];
		}
		default: {
			break;
		}
	}
	return 0;
}

-(id)initWithImage:(UIImage*)image_
{
	if (self = [super init])
	{
		image = [image_ retain];
		type = TiBlobTypeImage;
		mimetype = [([UIImageAlpha hasAlpha:image_] ? MIMETYPE_PNG : MIMETYPE_JPEG) copy];
	}
	return self;
}

-(id)initWithData:(NSData*)data_ mimetype:(NSString*)mimetype_
{
	if (self = [super init])
	{
		data = [data_ retain];
		type = TiBlobTypeData;
		mimetype = [mimetype_ copy];
	}
	return self;
}

-(id)initWithFile:(NSString*)path_
{
	if (self = [super init])
	{
		type = TiBlobTypeFile;
		path = [path_ retain];
		mimetype = [[Mimetypes mimeTypeForExtension:path] copy];
	}
	return self;
}

-(TiBlobType)type
{
	return type;
}

-(NSString*)mimeType
{
	return mimetype;
}

-(NSString*)text
{
	switch (type)
	{
		case TiBlobTypeFile:
		{
			NSData *fdata = [self data];
			return [[[NSString alloc] initWithData:fdata encoding:NSUTF8StringEncoding] autorelease];
		}
		case TiBlobTypeData:
		{
			return [[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] autorelease];
		}
		default: {
			break;
		}
	}
	// anything else we refuse to write out
	return nil;
}

-(NSData*)data
{
	switch(type)
	{
		case TiBlobTypeFile:
		{
			NSError *error = nil;
			return [NSData dataWithContentsOfFile:path options:0 error:&error];
		}
		case TiBlobTypeImage:
		{
            if ([mimetype isEqualToString:MIMETYPE_PNG]) {
                return UIImagePNGRepresentation(image);
            }
            return UIImageJPEGRepresentation(image,1.0);
		}
		default: {
			break;
		}
	}
	return data;
}

-(UIImage*)image
{
	[self ensureImageLoaded];
	return image;
}

-(void)setData:(NSData*)data_
{
	RELEASE_TO_NIL(data);
	RELEASE_TO_NIL(image);
	type = TiBlobTypeData;
	data = [data_ retain];
	imageLoadAttempted = NO;
}

-(void)setImage:(UIImage *)image_
{
	RELEASE_TO_NIL(image);
	image = [image_ retain];
    [self setMimeType:([UIImageAlpha hasAlpha:image_] ? MIMETYPE_PNG : MIMETYPE_JPEG) type:TiBlobTypeImage];
}

-(NSString*)path
{
	return path;
}

// For Android compatibility
-(TiFile *)file
{	/**
	 *	Having such a conditional compile deep in TiBlob may have implications
	 *	later on if we restructure platform. This may also mean we should
	 *	require filesystem to always be compiled in, but that seems overkill
	 *	for now. There may be some issues with parity with Android's
	 *	implementation in behavior when filesystem module is missing or when the
	 *	path does not point to a valid file.
	 *	TODO: What is expected behavior when path is valid but there's no file?
	 *	TODO: Should file property require explicit use of filesystem module?
	 */
#ifdef USE_TI_FILESYSTEM
	if (path != nil) {
		return [[[TiFilesystemFileProxy alloc] initWithFile:path] autorelease];	
	}
#else
	NSLog(@"[FATAL] Blob.file property requested but the Filesystem module was never requested.")
#endif
	return nil;
}

-(id)nativePath
{
    if (path != nil) {
	    return [[NSURL fileURLWithPath:path] absoluteString];
    }
    return [NSNull null];
}

-(NSNumber*)length
{
    return NUMLONGLONG([[self data] length]);
}

-(void)setMimeType:(NSString*)mime type:(TiBlobType)type_
{
	RELEASE_TO_NIL(mimetype);
	mimetype = [mime copy];
	type = type_;
}

-(BOOL)writeTo:(NSString*)destination error:(NSError**)error
{
	NSData *writeData = nil;
	switch(type)
	{
		case TiBlobTypeFile:
		{
			NSFileManager *fm = [NSFileManager defaultManager];
			return [fm copyItemAtPath:path toPath:destination error:error];
		}
		case TiBlobTypeImage:
		{
			writeData = [self data];
			break;
		}
		case TiBlobTypeData:
		{
			writeData = data;
			break;
		}
	}
	if (writeData!=nil)
	{
		return [writeData writeToFile:destination atomically:YES];
	}
	return NO;
}

#pragma mark Image Manipulations

- (id)imageWithAlpha:(id)args
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		TiBlob *blob = [[TiBlob alloc] initWithImage:[UIImageAlpha imageWithAlpha:image]];
		return [blob autorelease];
	}
	return nil;
}

- (id)imageWithTransparentBorder:(id)args
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		ENSURE_SINGLE_ARG(args,NSObject);
		NSUInteger size = [TiUtils intValue:args];
		TiBlob *blob = [[TiBlob alloc] initWithImage:[UIImageAlpha transparentBorderImage:size image:image]];
		return [blob autorelease];
	}
	return nil;
}

- (id)imageWithRoundedCorner:(id)args
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		NSUInteger cornerSize = [TiUtils intValue:[args objectAtIndex:0]];
		NSUInteger borderSize = [args count] > 1 ? [TiUtils intValue:[args objectAtIndex:1]] : 1;
		TiBlob *blob =  [[TiBlob alloc] initWithImage:[UIImageRoundedCorner roundedCornerImage:cornerSize borderSize:borderSize image:image]];
		return [blob autorelease];
	}
	return nil;
}

- (id)imageAsThumbnail:(id)args
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		NSUInteger size = [TiUtils intValue:[args objectAtIndex:0]];
		NSUInteger borderSize = [args count] > 1 ? [TiUtils intValue:[args objectAtIndex:1]] : 1;
		NSUInteger cornerRadius = [args count] > 2 ? [TiUtils intValue:[args objectAtIndex:2]] : 0;
		TiBlob *blob = [[TiBlob alloc] initWithImage:[UIImageResize thumbnailImage:size
												  transparentBorder:borderSize
													   cornerRadius:cornerRadius
											   interpolationQuality:kCGInterpolationHigh
															  image:image]];
		return [blob autorelease];		
	}
	return nil;
}

- (id)imageAsResized:(id)args
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		ENSURE_ARG_COUNT(args,2);
		NSUInteger width = [TiUtils intValue:[args objectAtIndex:0]];
		NSUInteger height = [TiUtils intValue:[args objectAtIndex:1]];
		TiBlob *blob =  [[TiBlob alloc] initWithImage:[UIImageResize resizedImage:CGSizeMake(width, height) interpolationQuality:kCGInterpolationHigh image:image hires:NO]];
		return [blob autorelease];
	}
	return nil;
}

- (id)imageAsCropped:(id)args
{
	[self ensureImageLoaded];
	if (image!=nil)
	{
		ENSURE_SINGLE_ARG(args,NSDictionary);
		CGRect bounds;
		CGSize imageSize = [image size];
		bounds.size.width = [TiUtils floatValue:@"width" properties:args def:imageSize.width];
		bounds.size.height = [TiUtils floatValue:@"height" properties:args def:imageSize.height];
		bounds.origin.x = [TiUtils floatValue:@"x" properties:args def:(imageSize.width - bounds.size.width) / 2.0];
		bounds.origin.y = [TiUtils floatValue:@"y" properties:args def:(imageSize.height - bounds.size.height) / 2.0];
		TiBlob *blob = [[TiBlob alloc] initWithImage:[UIImageResize croppedImage:bounds image:image]];
		return [blob autorelease];
	}
	return nil;
}

-(id)toString:(id)args
{
	id t = [self text];
	if (t!=nil)
	{
		return t;
	}
	return [super toString:args];
}

@end
