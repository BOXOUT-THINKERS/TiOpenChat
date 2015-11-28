/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#if defined(USE_TI_UIIPADDOCUMENTVIEWER) || defined(USE_TI_UIIOSDOCUMENTVIEWER)
#import "TiUIiOSDocumentViewerProxy.h"
#import "TiUtils.h"
#import "TiBlob.h"
#import "TiApp.h"
#import "TiViewProxy.h"

@implementation TiUIiOSDocumentViewerProxy

-(void)_destroy
{
	controller.delegate = nil;
	RELEASE_TO_NIL(controller);
	[super _destroy];
}

-(UIDocumentInteractionController*)controller
{
	if (controller==nil)
	{
		NSURL *url = [TiUtils toURL:[self valueForUndefinedKey:@"url"] proxy:self];
		controller = [[UIDocumentInteractionController interactionControllerWithURL:url] retain];
		controller.delegate = self;
	}
	return controller;
}

-(NSString*)apiName
{
    return @"Ti.UI.iOS.DocumentViewer";
}

-(void)setAnnotation:(id)args
{
	[self controller].annotation = [args objectAtIndex:0];
}

-(void)show:(id)args
{
	ENSURE_SINGLE_ARG_OR_NIL(args,NSDictionary);
	[self rememberSelf];
	ENSURE_UI_THREAD(show, args);
	BOOL animated = [TiUtils boolValue:@"animated" properties:args def:YES];

	TiViewProxy* view = [args objectForKey:@"view"];
	if (view!=nil)
	{
		if ([view supportsNavBarPositioning] && [view isUsingBarButtonItem])
		{
			UIBarButtonItem *item = [view barButtonItem];
			[[self controller] presentOptionsMenuFromBarButtonItem:item animated:animated];
			return;
		}
		
		CGRect rect = [TiUtils rectValue:args];
		[[self controller] presentOptionsMenuFromRect:rect inView:[view view] animated:animated];
		return;
	}
	
	[[self controller] presentPreviewAnimated:animated];
}

-(void)hide:(id)args
{
	ENSURE_TYPE_OR_NIL(args,NSDictionary);
	ENSURE_UI_THREAD(hide, args);
	BOOL animated = [TiUtils boolValue:@"animated" properties:args def:YES];
	[[self controller] dismissPreviewAnimated:animated];
}

-(id)url
{
	if (controller!=nil)
	{
		return [[[self controller] URL] absoluteString];
	}
	return nil;
}

-(void)setUrl:(id)value
{
	ENSURE_TYPE(value,NSString);
	NSURL *url = [TiUtils toURL:value proxy:self];
	//UIDocumentInteractionController is recommended to be a new instance for every different url
	//instead of having _tiopenchat developer create a new instance every time a new document url is loaded
	//we assume that setUrl is called to change doc, so we go ahead and release the controller and create
	//a new one when asked to present
	RELEASE_TO_NIL(controller);
	[self replaceValue:url forKey:@"url" notification:NO];
}

-(id)icons
{
	NSMutableArray *result = [NSMutableArray array];
	
	for (UIImage *image in [self controller].icons)
	{
		TiBlob *blob = [[TiBlob alloc] initWithImage:image];
		[result addObject:image];
		[blob release];
	}
	
	return result;
}

-(id)name
{
	if (controller!=nil)
	{
		return [controller name];
	}
	return nil;
}

#pragma mark Delegates

- (UIViewController *)documentInteractionControllerViewControllerForPreview:(UIDocumentInteractionController *)controller
{
    return [[TiApp controller] topPresentedController];
}
 
/*
- (UIView *)documentInteractionControllerViewForPreview:(UIDocumentInteractionController *)controller
{
	return viewController.view;
}*/

- (void)documentInteractionControllerWillBeginPreview:(UIDocumentInteractionController *)controller
{
	if ([self _hasListeners:@"load"])
	{
		[self fireEvent:@"load" withObject:nil];
	}
}

- (void)documentInteractionControllerDidEndPreview:(UIDocumentInteractionController *)controller
{
	if ([self _hasListeners:@"unload"])
	{
		[self fireEvent:@"unload" withObject:nil];
	}
	[self forgetSelf];
}


- (void)documentInteractionControllerWillPresentOpenInMenu:(UIDocumentInteractionController *)controller
{
	if ([self _hasListeners:@"menu"])
	{
		NSDictionary *event = [NSDictionary dictionaryWithObject:@"open" forKey:@"type"];
		[self fireEvent:@"menu" withObject:event];
	}
}

- (void)documentInteractionControllerWillPresentOptionsMenu:(UIDocumentInteractionController *)controller
{
	if ([self _hasListeners:@"menu"])
	{
		NSDictionary *event = [NSDictionary dictionaryWithObject:@"options" forKey:@"type"];
		[self fireEvent:@"menu" withObject:event];
	}
}



@end

#endif
