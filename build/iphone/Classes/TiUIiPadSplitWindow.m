/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#import "TiBase.h"

#ifdef USE_TI_UIIPADSPLITWINDOW
#ifndef USE_TI_UIIPADSPLITWINDOWBUTTON
#define USE_TI_UIIPADSPLITWINDOWBUTTON
#endif


#import "TiUIiPadSplitWindow.h"
#import "TiUtils.h"
#import "TiViewController.h"
#import "TiApp.h"
#import "TiUIiPadPopoverProxy.h"
#import "TiWindowProxy.h"

#ifdef USE_TI_UIIPADSPLITWINDOWBUTTON
#import "TiUIiPadSplitWindowButtonProxy.h"
#endif

UIViewController * ControllerForProxy(TiViewProxy * proxy);

UIViewController * ControllerForProxy(TiViewProxy * proxy)
{
    if ([proxy isKindOfClass:[TiWindowProxy class]]) {
        [(TiWindowProxy*)proxy setIsManaged:YES];
        return [(TiWindowProxy*)proxy hostingController];
    }

	[[proxy view] setAutoresizingMask:UIViewAutoresizingNone];

	return [[[TiViewController alloc] initWithViewProxy:proxy] autorelease];
}


@implementation TiUIiPadSplitWindow

-(void)dealloc
{
	RELEASE_TO_NIL(controller);
	[super dealloc];
}

-(UIViewController*)controller
{
	if (controller==nil)
	{
		TiViewProxy* masterProxy = [self.proxy valueForUndefinedKey:@"masterView"];
		TiViewProxy* detailProxy = [self.proxy valueForUndefinedKey:@"detailView"];
        
		controller = [[MGSplitViewController alloc] init];		
		[controller setViewControllers:[NSArray arrayWithObjects:
				ControllerForProxy(masterProxy),ControllerForProxy(detailProxy),nil]];
		[TiUtils configureController:controller withObject:nil];
		controller.delegate = self;
        
		UIView * controllerView = [controller view];
		
		[controllerView setFrame:[self bounds]];
		[self addSubview:controllerView];

		[controller viewWillAppear:NO];

		[controller willAnimateRotationToInterfaceOrientation:[[UIApplication sharedApplication] statusBarOrientation] duration:0.0];

		if ([masterProxy isKindOfClass:[TiWindowProxy class]]) {
			[(TiWindowProxy*)masterProxy open:nil];
		} else {
			[masterProxy windowWillOpen];
			[masterProxy windowDidOpen];
		}
		
		if ([detailProxy isKindOfClass:[TiWindowProxy class]]) {
			[(TiWindowProxy*)detailProxy open:nil];
		} else {
			[detailProxy windowWillOpen];
			[detailProxy windowDidOpen];
		}
		[controller viewDidAppear:NO];
	}
	return controller;
}

-(void)frameSizeChanged:(CGRect)frame bounds:(CGRect)bounds
{
	[[[self controller] view] setFrame:bounds];
    [super frameSizeChanged:frame bounds:bounds];
}

//FIXME - probably should remove this ... not sure...

-(void)setToolbar:(id)items withObject:(id)properties
{
	BOOL animated = [TiUtils boolValue:@"animated" properties:properties def:YES];
	UINavigationController*c = [[controller viewControllers] objectAtIndex:1];
	UIViewController *vc = [[c viewControllers] objectAtIndex:0];
	
	if (items!=nil)
	{
		NSMutableArray *array = [NSMutableArray array];
		for (TiViewProxy *proxy in items)
		{
			if ([proxy supportsNavBarPositioning])
			{
				// detach existing one
				UIBarButtonItem *item = [proxy barButtonItem];
				[array addObject:item];
			}
			else
			{
				NSString *msg = [NSString stringWithFormat:@"%@ doesn't support positioning on the nav bar",proxy];
				THROW_INVALID_ARG(msg);
			}
		}		
		[vc setToolbarItems:array animated:animated];
		[c setToolbarHidden:NO animated:animated];
	}	
	else
	{
		[vc setToolbarItems:nil animated:animated];
		[c setToolbarHidden:YES animated:animated];
	}
}

#pragma mark Split Window properties

-(void)setMasterPopupVisible_:(id)value
{
	BOOL showPopover = [TiUtils boolValue:value def:NO];
	MGSplitViewController * splitController = (MGSplitViewController *)[self controller];
	BOOL masterInSplit = [splitController isShowingMaster];

	if (masterInSplit)
	{
		[(TiUIiPadSplitWindowProxy*) [self proxy] popupVisibilityChanged:NO];
		return;
	}

	if (showPopover)
	{
		[splitController showMasterPopover:self];
	}
	else
	{
		[splitController hideMasterPopover:self];
	}
}

-(void)setShowMasterInPortrait_:(id)value
{
    BOOL showMaster = [TiUtils boolValue:value def:NO];
    MGSplitViewController* splitController = (MGSplitViewController*)[self controller];
    [splitController setShowsMasterInPortrait:showMaster];
    
    [[self proxy] replaceValue:value forKey:@"showMasterInPortrait" notification:NO];
}

#pragma mark Delegate 

- (void)splitViewController:(UISplitViewController*)svc willHideViewController:(UIViewController *)aViewController withBarButtonItem:(UIBarButtonItem*)barButtonItem forPopoverController:(UIPopoverController*)pc
{
	[(TiUIiPadSplitWindowProxy*) [self proxy] popupVisibilityChanged:NO];
	if ([self.proxy _hasListeners:@"visible"])
	{
		NSMutableDictionary *event = [NSMutableDictionary dictionaryWithObject:@"detail" forKey:@"view"];
#ifdef USE_TI_UIIPADSPLITWINDOWBUTTON
		TiUIiPadSplitWindowButtonProxy *button = [[TiUIiPadSplitWindowButtonProxy alloc] initWithButton:barButtonItem pageContext:[self.proxy pageContext]];
		[event setObject:button forKey:@"button"];
		[button release];
#endif		
		[self.proxy fireEvent:@"visible" withObject:event];
	}
}

- (void)splitViewController:(UISplitViewController*)svc willShowViewController:(UIViewController *)aViewController invalidatingBarButtonItem:(UIBarButtonItem *)button
{
	[(TiUIiPadSplitWindowProxy*) [self proxy] popupVisibilityChanged:NO];
	if ([self.proxy _hasListeners:@"visible"])
	{
		NSDictionary *event = [NSDictionary dictionaryWithObject:@"master" forKey:@"view"];
		[self.proxy fireEvent:@"visible" withObject:event];
	}
}

- (void)splitViewController:(UISplitViewController*)svc popoverController:(UIPopoverController*)pc willPresentViewController:(UIViewController *)aViewController
{
	[(TiUIiPadSplitWindowProxy*) [self proxy] popupVisibilityChanged:YES];
	if ([self.proxy _hasListeners:@"visible"])
	{
		NSMutableDictionary *event = [NSMutableDictionary dictionaryWithObject:@"popover" forKey:@"view"];
		[self.proxy fireEvent:@"visible" withObject:event];
	}
}


@end

#endif
