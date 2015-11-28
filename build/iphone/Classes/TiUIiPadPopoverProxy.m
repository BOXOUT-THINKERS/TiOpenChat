/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#if defined(USE_TI_UIIPADPOPOVER) || defined(USE_TI_UIIPADSPLITWINDOW)

#import "TiUIiPadPopoverProxy.h"
#import "TiUtils.h"
#import "TiWindowProxy.h"
#import "TiApp.h"
#import <libkern/OSAtomic.h>

#ifdef USE_TI_UITABLEVIEW
#import "TiUITableViewRowProxy.h"
#endif

static NSCondition* popOverCondition;
static BOOL currentlyDisplaying = NO;
TiUIiPadPopoverProxy * currentPopover;

@implementation TiUIiPadPopoverProxy

static NSArray* popoverSequence;

#pragma mark Internal

-(NSArray *)keySequence
{
	if (popoverSequence == nil)
	{
		popoverSequence = [[NSArray arrayWithObjects:@"contentView",@"width",@"height",nil] retain];
	}
	return popoverSequence;
}
#pragma mark Setup

-(id)init
{
    if (self = [super init]) {
        closingCondition = [[NSCondition alloc] init];
        directions = UIPopoverArrowDirectionAny;
        poWidth = TiDimensionUndefined;
        poHeight = TiDimensionUndefined;
    }
    return self;
}

-(void)dealloc
{
	if (currentPopover == self) {
		//This shouldn't happen because we clear it on hide.
		currentPopover = nil;
	}
	RELEASE_TO_NIL(viewController);
	RELEASE_TO_NIL(popoverController);
	RELEASE_TO_NIL(popoverView);
    RELEASE_TO_NIL(closingCondition);
    RELEASE_TO_NIL(contentViewProxy);
	[super dealloc];
}

#pragma mark Public API
-(NSString*)apiName
{
    return @"Ti.UI.iPad.Popover";
}

#pragma mark Public Constants

-(NSNumber*)arrowDirection
{
    return NUMINTEGER(directions);
}

-(void)setArrowDirection:(id)args
{
    if (popoverInitialized) {
        DebugLog(@"[ERROR] Arrow Directions can only be set before showing the popover.")
        return;
    }
    
    ENSURE_SINGLE_ARG(args, NSNumber)
    UIPopoverArrowDirection theDirection = [TiUtils intValue:args];
    if ( (theDirection != UIPopoverArrowDirectionAny) && (theDirection != UIPopoverArrowDirectionLeft)
        &&(theDirection != UIPopoverArrowDirectionRight) && (theDirection != UIPopoverArrowDirectionUp)
        &&(theDirection != UIPopoverArrowDirectionDown) ){
        theDirection = UIPopoverArrowDirectionAny;
    }
    directions = theDirection;
}

-(void)setContentView:(id)value
{
    if (popoverInitialized) {
        DebugLog(@"[ERROR] Changing contentView when the popover is showing is not supported");
        return;
    }
    ENSURE_SINGLE_ARG(value, TiViewProxy);
    
    if (contentViewProxy != nil) {
        RELEASE_TO_NIL(contentViewProxy);
    }
    contentViewProxy = [(TiViewProxy*) value retain];
    [self replaceValue:contentViewProxy forKey:@"contentView" notification:NO];
    
}

-(void)setPassthroughViews:(id)args
{
    ENSURE_TYPE(args, NSArray);
    NSArray* actualArgs = nil;
    if ([[args objectAtIndex:0] isKindOfClass:[NSArray class]]) {
        actualArgs = (NSArray*)[args objectAtIndex:0];
    } else {
        actualArgs = args;
    }
    for (TiViewProxy* proxy in actualArgs) {
        if (![proxy isKindOfClass:[TiViewProxy class]]) {
            [self throwException:[NSString stringWithFormat:@"Passed non-view object %@ as passthrough view",proxy]
                       subreason:nil
                        location:CODELOCATION];
        }
    }
    [self replaceValue:actualArgs forKey:@"passthroughViews" notification:NO];
    
    
    if (popoverInitialized) {
        TiThreadPerformOnMainThread(^{
            [self updatePassThroughViews];
        }, NO);
    }
}

-(void)setWidth:(id)value
{
    ENSURE_SINGLE_ARG_OR_NIL(value, NSObject);
    DebugLog(@"[WARN] Setting width on the popover directly is deprecated. Change the width property of the contentView property instead");
    
    if (IS_NULL_OR_NIL(value)) {
        poWidth = TiDimensionUndefined;
    } else {
        poWidth = TiDimensionFromObject(value);
    }
    [self replaceValue:value forKey:@"width" notification:NO];
    
    if (popoverInitialized) {
        TiThreadPerformOnMainThread(^{[self updateContentSize];}, NO);
    }
}

-(void)setHeight:(id)value
{
    ENSURE_SINGLE_ARG_OR_NIL(value, NSObject);
    DebugLog(@"[WARN] Setting height on the popover directly is deprecated. Change the height property of the contentView property instead");
    
    if (IS_NULL_OR_NIL(value)) {
        poHeight = TiDimensionUndefined;
    } else {
        poHeight = TiDimensionFromObject(value);
    }
    [self replaceValue:value forKey:@"height" notification:NO];
    
    if (popoverInitialized) {
        TiThreadPerformOnMainThread(^{[self updateContentSize];}, NO);
    }
}

-(void)setTitle:(id)item
{
    DebugLog(@"[ERROR] Support for setting title on the popover directly is removed in 3.4.2");
}

-(void)setRightNavButton:(id)args
{
    DebugLog(@"[ERROR] Support for setting rightNavButton on the popover directly is removed in 3.4.2");
}

-(void)setLeftNavButton:(id)args
{
    DebugLog(@"[ERROR] Support for setting leftNavButton on the popover directly is removed in 3.4.2");
}

#pragma mark Public Methods

-(void)show:(id)args
{
    if (popOverCondition == nil) {
        popOverCondition = [[NSCondition alloc] init];
    }

    if (popoverInitialized) {
        DebugLog(@"Popover is already showing. Ignoring call")
        return;
    }
    
    if (contentViewProxy == nil) {
        DebugLog(@"[ERROR] Popover presentation without contentView property set is no longer supported. Ignoring call")
        return;
    }
    
    ENSURE_SINGLE_ARG_OR_NIL(args,NSDictionary);
    [self rememberSelf];
    [self retain];
    
    [closingCondition lock];
    if (isDismissing) {
        [closingCondition wait];
    }
    [closingCondition unlock];

    animated = [TiUtils boolValue:@"animated" properties:args def:YES];
    popoverView = [[args objectForKey:@"view"] retain];
    NSDictionary *rectProps = [args objectForKey:@"rect"];
    if (IS_NULL_OR_NIL(rectProps)) {
        popoverRect = CGRectZero;
    } else {
        popoverRect = [TiUtils rectValue:rectProps];
    }
    
    if (IS_NULL_OR_NIL(popoverView)) {
        DebugLog(@"[ERROR] Popover presentation without view property in the arguments is not supported. Ignoring call")
        RELEASE_TO_NIL(popoverView);
        return;
    }
    
    [popOverCondition lock];
    if (currentlyDisplaying) {
        [currentPopover hide:nil];
        [popOverCondition wait];
    }
    currentlyDisplaying = YES;
    [popOverCondition unlock];
    popoverInitialized = YES;

    TiThreadPerformOnMainThread(^{
        [self initAndShowPopOver];
    }, YES);
}


-(void)hide:(id)args
{
    if (!popoverInitialized) {
        DebugLog(@"Popover is not showing. Ignoring call")
        return;
    }
    
	ENSURE_SINGLE_ARG_OR_NIL(args,NSDictionary);

	[closingCondition lock];
	isDismissing = YES;
	[closingCondition unlock];

	TiThreadPerformOnMainThread(^{
        [contentViewProxy windowWillClose];
        animated = [TiUtils boolValue:@"animated" properties:args def:NO];
        if ([TiUtils isIOS8OrGreater]) {
            [[self viewController] dismissViewControllerAnimated:animated completion:^{
                [self cleanup];
            }];

        } else {
            [[self popoverController] dismissPopoverAnimated:animated];
            [self performSelector:@selector(popoverControllerDidDismissPopover:) withObject:popoverController afterDelay:(animated?0.5:0.1)];
        }
	},NO);
}


#pragma mark Internal Methods

-(void)cleanup
{
    [popOverCondition lock];
    currentlyDisplaying = NO;
    if (currentPopover == self) {
        currentPopover = nil;
    }
    [popOverCondition broadcast];
    [popOverCondition unlock];

    if (!popoverInitialized)
    {
        [closingCondition lock];
        isDismissing = NO;
        [closingCondition signal];
        [closingCondition unlock];
        
        return;
    }
    [contentViewProxy setProxyObserver:nil];
    [contentViewProxy windowWillClose];
    
    popoverInitialized = NO;
    [self fireEvent:@"hide" withObject:nil]; //Checking for listeners are done by fireEvent anyways.
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillChangeStatusBarOrientationNotification object:nil];
    [contentViewProxy windowDidClose];
    if ([contentViewProxy isKindOfClass:[TiWindowProxy class]] || [TiUtils isIOS8OrGreater]) {
        UIView* topWindowView = [[[TiApp app] controller] topWindowProxyView];
        if ([topWindowView isKindOfClass:[TiUIView class]]) {
            TiViewProxy* theProxy = (TiViewProxy*)[(TiUIView*)topWindowView proxy];
            if ([theProxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
                [(id<TiWindowProtocol>)theProxy gainFocus];
            }
        }
    }
    [self forgetSelf];
    RELEASE_TO_NIL(viewController);
    RELEASE_TO_NIL(popoverView);
    RELEASE_TO_NIL_AUTORELEASE(popoverController);
    [self performSelector:@selector(release) withObject:nil afterDelay:0.5];
    [closingCondition lock];
    isDismissing = NO;
    [closingCondition signal];
    [closingCondition unlock];
}

-(void)initAndShowPopOver
{
    currentPopover = self;
    if (![TiUtils isIOS8OrGreater]) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(updatePopover:) name:UIApplicationWillChangeStatusBarOrientationNotification object:nil];
        [self updatePassThroughViews];
    }
    [contentViewProxy setProxyObserver:self];
    if ([contentViewProxy isKindOfClass:[TiWindowProxy class]]) {
        UIView* topWindowView = [[[TiApp app] controller] topWindowProxyView];
        if ([topWindowView isKindOfClass:[TiUIView class]]) {
            TiViewProxy* theProxy = (TiViewProxy*)[(TiUIView*)topWindowView proxy];
            if ([theProxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
                [(id<TiWindowProtocol>)theProxy resignFocus];
            }
        }
        [(TiWindowProxy*)contentViewProxy setIsManaged:YES];
        [(TiWindowProxy*)contentViewProxy open:nil];
        [(TiWindowProxy*) contentViewProxy gainFocus];
        [self updatePopoverNow];
    } else {
        [contentViewProxy windowWillOpen];
        [contentViewProxy reposition];
        [self updatePopoverNow];
        [contentViewProxy windowDidOpen];
    }
}

-(void)updatePopover:(NSNotification *)notification;
{
    //This may be due to a possible race condition of rotating the iPad while another popover is coming up.
    if ((currentPopover != self)) {
        return;
    }
    [self performSelector:@selector(updatePopoverNow) withObject:nil afterDelay:[[UIApplication sharedApplication] statusBarOrientationAnimationDuration] inModes:[NSArray arrayWithObject:NSRunLoopCommonModes]];
}


-(CGSize)contentSize
{
#ifndef TI_USE_AUTOLAYOUT
    CGSize screenSize = [[UIScreen mainScreen] bounds].size;
    if (![TiUtils isIOS8OrGreater]) {
        UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
        
        if (orientation == UIInterfaceOrientationLandscapeRight || orientation ==  UIInterfaceOrientationLandscapeLeft ) {
            CGSize tempSize = CGSizeMake(screenSize.height, screenSize.width);
            screenSize = tempSize;
        }
    }
    
    if (poWidth.type != TiDimensionTypeUndefined) {
        [contentViewProxy layoutProperties]->width.type = poWidth.type;
        [contentViewProxy layoutProperties]->width.value = poWidth.value;
        poWidth = TiDimensionUndefined;
    }
    
    if (poHeight.type != TiDimensionTypeUndefined) {
        [contentViewProxy layoutProperties]->height.type = poHeight.type;
        [contentViewProxy layoutProperties]->height.value = poHeight.value;
        poHeight = TiDimensionUndefined;
    }
    
    return SizeConstraintViewWithSizeAddingResizing([contentViewProxy layoutProperties], contentViewProxy, screenSize , NULL);
#else
    return CGSizeZero;
#endif
}

-(void)updatePassThroughViews
{
    NSArray* theViewProxies = [self valueForKey:@"passthroughViews"];
    if (IS_NULL_OR_NIL(theViewProxies)) {
        return;
    }
    NSMutableArray* theViews = [NSMutableArray arrayWithCapacity:[theViewProxies count]];
    for (TiViewProxy* proxy in theViewProxies) {
        [theViews addObject:[proxy view]];
    }
    
    if ([TiUtils isIOS8OrGreater]) {
        [[[self viewController] popoverPresentationController] setPassthroughViews:theViews];
    } else {
        [[self popoverController] setPassthroughViews:theViews];
    }
}

-(void)updateContentSize
{
    CGSize newSize = [self contentSize];
    [[self viewController] setPreferredContentSize:newSize];
    [contentViewProxy reposition];
}

-(void)updatePopoverNow
{
    // We're in the middle of playing cleanup while a hide() is happening.
    [closingCondition lock];
    if (isDismissing) {
        [closingCondition unlock];
        return;
    }
    [closingCondition unlock];
    [self updateContentSize];
    if ([TiUtils isIOS8OrGreater]) {
        UIViewController* theController = [self viewController];
        [theController setModalPresentationStyle:UIModalPresentationPopover];
        UIPopoverPresentationController* thePresentationController = [theController popoverPresentationController];
        thePresentationController.permittedArrowDirections = directions;
        thePresentationController.delegate = self;
        
        [[TiApp app] showModalController:theController animated:animated];
        return;
    }

    if ([popoverView isUsingBarButtonItem])
    {
        UIBarButtonItem * ourButtonItem = [popoverView barButtonItem];
        @try {
            /*
             *	Because buttonItems may or many not have a view, there is no way for us
             *	to know beforehand if the request is an invalid one.
             */
            [[self popoverController] presentPopoverFromBarButtonItem: ourButtonItem permittedArrowDirections:directions animated:animated];
        }
        @catch (NSException *exception) {
            DebugLog(@"[WARN] Popover requested on view not attached to current window.");
        }
    }
    else
    {
        UIView *view_ = [popoverView view];
#ifdef USE_TI_UITABLEVIEW
        if (view_ == nil && [popoverView isKindOfClass:[TiUITableViewRowProxy class]] && [popoverView viewAttached]) {
            view_ = [[(TiUITableViewRowProxy*)popoverView callbackCell] contentView];
        }
#endif
        if ([view_ window] == nil) {
            // No window, so we can't display the popover...
            DebugLog(@"[WARN] Unable to display popover; view is not attached to the current window");
            return;
        }
        
        CGRect rect;
        if (CGRectIsEmpty(popoverRect))
        {
            rect = [view_ bounds];
        }
        else
        {
            rect = popoverRect;
        }
        
        [[self popoverController] presentPopoverFromRect:rect inView:view_ permittedArrowDirections:directions animated:animated];
    }
}


-(UIViewController *)viewController
{
    if (viewController == nil) {
        if ([contentViewProxy isKindOfClass:[TiWindowProxy class]]) {
            [(TiWindowProxy*)contentViewProxy setIsManaged:YES];
            viewController =  [[(TiWindowProxy*)contentViewProxy hostingController] retain];
        } else {
            viewController = [[TiViewController alloc] initWithViewProxy:contentViewProxy];
        }
    }
    return viewController;
}

-(UIPopoverController *)popoverController
{
    if (popoverController == nil) {
        popoverController = [[UIPopoverController alloc] initWithContentViewController:[self viewController]];
        [popoverController setDelegate:self];
        [self updateContentSize];
    }
    return popoverController;
}

#pragma mark Delegate methods

-(void)proxyDidRelayout:(id)sender
{
    if (sender == contentViewProxy) {
        if (viewController != nil) {
            CGSize newSize = [self contentSize];
            if (!CGSizeEqualToSize([viewController preferredContentSize], newSize)) {
                [self updateContentSize];
            }
        }
    }
}

- (void)prepareForPopoverPresentation:(UIPopoverPresentationController *)popoverPresentationController
{
    [self updatePassThroughViews];
    if (popoverView != nil) {
        if ([popoverView supportsNavBarPositioning] && [popoverView isUsingBarButtonItem]) {
            UIBarButtonItem* theItem = [popoverView barButtonItem];
            if (theItem != nil) {
                popoverPresentationController.barButtonItem = [popoverView barButtonItem];
                return;
            }
        }
        
        UIView* view = [popoverView view];
        if (view != nil && (view.window != nil)) {
            popoverPresentationController.sourceView = view;
            popoverPresentationController.sourceRect = (CGRectEqualToRect(CGRectZero, popoverRect)?[view bounds]:popoverRect);
            return;
        }
    }
    
    //Fell through.
    UIViewController* presentingController = [[self viewController] presentingViewController];
    popoverPresentationController.sourceView = [presentingController view];
    popoverPresentationController.sourceRect = (CGRectEqualToRect(CGRectZero, popoverRect)?CGRectMake(presentingController.view.bounds.size.width/2, presentingController.view.bounds.size.height/2, 1, 1):popoverRect);
}

- (BOOL)popoverPresentationControllerShouldDismissPopover:(UIPopoverPresentationController *)popoverPresentationController
{
    if ([[self viewController] presentedViewController] != nil) {
        return NO;
    }
    [contentViewProxy windowWillClose];
    return YES;
}

- (void)popoverPresentationControllerDidDismissPopover:(UIPopoverPresentationController *)popoverPresentationController
{
    [self cleanup];
}

- (void)popoverPresentationController:(UIPopoverPresentationController *)popoverPresentationController willRepositionPopoverToRect:(inout CGRect *)rect inView:(inout UIView **)view
{
    //This will never be called when using bar button item
    BOOL canUseDialogRect = !CGRectEqualToRect(CGRectZero, popoverRect);
    UIView* theSourceView = *view;
    
    if (!canUseDialogRect) {
        rect->origin = [theSourceView bounds].origin;
        rect->size = [theSourceView bounds].size;
    }
    
    popoverPresentationController.sourceRect = *rect;
}

- (BOOL)popoverControllerShouldDismissPopover:(UIPopoverController *)thisPopoverController
{
    if ([TiUtils isIOS8OrGreater]) {
        if (thisPopoverController.contentViewController.presentedViewController != nil) {
            return NO;
        }
    }
    [contentViewProxy windowWillClose];
    return YES;
}

- (void)popoverControllerDidDismissPopover:(UIPopoverController *)thisPopoverController
{
    if (thisPopoverController == popoverController) {
        [self cleanup];
    }
}

@end

#endif
