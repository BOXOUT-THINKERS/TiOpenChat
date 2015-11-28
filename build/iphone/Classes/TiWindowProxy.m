/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import "TiWindowProxy.h"
#import "TiUIWindow.h"
#import "TiApp.h"
#import "TiErrorController.h"

@interface TiWindowProxy(Private)
-(void)openOnUIThread:(id)args;
-(void)closeOnUIThread:(id)args;
-(void)rootViewDidForceFrame:(NSNotification *)notification;
@end

@implementation TiWindowProxy

@synthesize tab = tab;
@synthesize isManaged;

-(void) dealloc {
    if (controller != nil) {
#ifdef TI_USE_KROLL_THREAD
        TiThreadReleaseOnMainThread(controller, NO);
        controller = nil;
#else
        TiThreadPerformOnMainThread(^{
            RELEASE_TO_NIL(controller);
        }, YES);
#endif
    }
    
#ifdef USE_TI_UIIOSTRANSITIONANIMATION
    if(transitionProxy != nil)
    {
        [self forgetProxy:transitionProxy];
        RELEASE_TO_NIL(transitionProxy)
    }
#endif
    [super dealloc];
}

-(void)_destroy {
    [super _destroy];
}

-(void)_configure
{
    [self replaceValue:nil forKey:@"orientationModes" notification:NO];
    [super _configure];
}

-(NSString*)apiName
{
    return @"Ti.Window";
}

-(void)rootViewDidForceFrame:(NSNotification *)notification
{
    if (focussed && opened) {
        if ( (controller == nil) || ([controller navigationController] == nil) ) {
            return;
        }
        UINavigationController* nc = [controller navigationController];
        BOOL isHidden = [nc isNavigationBarHidden];
        [nc setNavigationBarHidden:!isHidden animated:NO];
        [nc setNavigationBarHidden:isHidden animated:NO];
        [[nc view] setNeedsLayout];
    }
}

-(TiUIView*)newView
{
	CGRect frame = [self appFrame];
	TiUIWindow * win = [[TiUIWindow alloc] initWithFrame:frame];
	[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(rootViewDidForceFrame:) name:kTiFrameAdjustNotification object:nil];
	return win;
}

-(BOOL)suppressesRelayout
{
    if (controller != nil) {
        //If controller view is not loaded, sandbox bounds will become zero.
        //In that case we do not want to mess up our sandbox, which is by default
        //mainscreen bounds. It will adjust when view loads.
        return ![controller isViewLoaded];
    }
    return [super suppressesRelayout];
}

#pragma mark - Utility Methods
-(void)windowWillOpen
{
    [super windowWillOpen];
    if (tab == nil && (self.isManaged == NO)) {
        [[[[TiApp app] controller] topContainerController] willOpenWindow:self];
    }
}

-(void)windowDidOpen
{
    opening = NO;
    opened = YES;
    if ([self _hasListeners:@"open"]) {
        [self fireEvent:@"open" withObject:nil withSource:self propagate:NO reportSuccess:NO errorCode:0 message:nil];
    }
    if (focussed && [self handleFocusEvents]) {
        if ([self _hasListeners:@"focus"]) {
            [self fireEvent:@"focus" withObject:nil withSource:self propagate:NO reportSuccess:NO errorCode:0 message:nil];
        }
    }
    [super windowDidOpen];
    [self forgetProxy:openAnimation];
    RELEASE_TO_NIL(openAnimation);
    if (tab == nil && (self.isManaged == NO)) {
        [[[[TiApp app] controller] topContainerController] didOpenWindow:self];
    }
}

-(void) windowWillClose
{
    if (tab == nil && (self.isManaged == NO)) {
        [[[[TiApp app] controller] topContainerController] willCloseWindow:self];
    }
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [super windowWillClose];
}

-(void) windowDidClose
{
    opened = NO;
    closing = NO;
    if ([self _hasListeners:@"close"]) {
        [self fireEvent:@"close" withObject:nil withSource:self propagate:NO reportSuccess:NO errorCode:0 message:nil];
    }
    [self forgetProxy:closeAnimation];
    RELEASE_TO_NIL(closeAnimation);
    if (tab == nil && (self.isManaged == NO)) {
        [[[[TiApp app] controller] topContainerController] didCloseWindow:self];
    }
    tab = nil;
    self.isManaged = NO;
    RELEASE_TO_NIL_AUTORELEASE(controller);
    [super windowDidClose];
    [self forgetSelf];
}

-(void)attachViewToTopContainerController
{
    UIViewController<TiControllerContainment>* topContainerController = [[[TiApp app] controller] topContainerController];
    UIView *rootView = [topContainerController hostingView];
    TiUIView* theView = [self view];
    [rootView addSubview:theView];
    [rootView bringSubviewToFront:theView];
    
    // TODO: Revisit
    /*
    UIViewController<TiControllerContainment>* topContainerController = [[[TiApp app] controller] topContainerController];
    UIView *rootView = [topContainerController hostingView];

    UIViewController* thisViewController = [self hostingController];
    UIView* theView = [thisViewController view];
    [theView setFrame:[rootView bounds]];
    
    [thisViewController willMoveToParentViewController:topContainerController];
    [topContainerController addChildViewController:thisViewController];
    
    [rootView addSubview:theView];
    [rootView bringSubviewToFront:theView];
    [thisViewController didMoveToParentViewController:topContainerController];
     */
}

-(BOOL)argOrWindowPropertyExists:(NSString*)key args:(id)args
{
    id value = [self valueForUndefinedKey:key];
    if (!IS_NULL_OR_NIL(value)) {
        return YES;
    }
    if (([args count] > 0) && [[args objectAtIndex:0] isKindOfClass:[NSDictionary class]]) {
        value = [[args objectAtIndex:0] objectForKey:key];
        if (!IS_NULL_OR_NIL(value)) {
            return YES;
        }
    }
    return NO;
}

-(BOOL)argOrWindowProperty:(NSString*)key args:(id)args
{
    if ([TiUtils boolValue:[self valueForUndefinedKey:key]]) {
        return YES;
    }
    if (([args count] > 0) && [[args objectAtIndex:0] isKindOfClass:[NSDictionary class]]) {
        return [TiUtils boolValue:key properties:[args objectAtIndex:0] def:NO];
    }
    return NO;
}

-(BOOL)isRootViewLoaded
{
    return [[[TiApp app] controller] isViewLoaded];
}

-(BOOL)isRootViewAttached
{
    //When a modal window is up, just return yes
    if ([[[TiApp app] controller] presentedViewController] != nil) {
        return YES;
    }
    return ([[[[TiApp app] controller] view] superview]!=nil);
}

#pragma mark - TiWindowProtocol Base Methods
-(void)open:(id)args
{
    //If an error is up, Go away
    if ([[[[TiApp app] controller] topPresentedController] isKindOfClass:[TiErrorController class]]) {
        DebugLog(@"[ERROR] ErrorController is up. ABORTING open");
        return;
    }
    
    //I am already open or will be soon. Go Away
    if (opening || opened) {
        return;
    }
    
    //Lets keep ourselves safe
    [self rememberSelf];

    //Make sure our RootView Controller is attached
    if (![self isRootViewLoaded]) {
        DebugLog(@"[WARN] ROOT VIEW NOT LOADED. WAITING");
        [self performSelector:@selector(open:) withObject:args afterDelay:0.1];
        return;
    }
    if (![self isRootViewAttached]) {
        DebugLog(@"[WARN] ROOT VIEW NOT ATTACHED. WAITING");
        [self performSelector:@selector(open:) withObject:args afterDelay:0.1];
        return;
    }
    
    opening = YES;
    
    isModal = (tab == nil && !self.isManaged) ? [self argOrWindowProperty:@"modal" args:args] : NO;
    
    if ([self argOrWindowProperty:@"fullscreen" args:args]) {
        hidesStatusBar = YES;
    } else {
        if ([self argOrWindowPropertyExists:@"fullscreen" args:args]) {
            hidesStatusBar = NO;
        } else {
            hidesStatusBar = [[[TiApp app] controller] statusBarInitiallyHidden];
        }
    }
    
    int theStyle = [TiUtils intValue:[self valueForUndefinedKey:@"statusBarStyle"] def:[[[TiApp app] controller] defaultStatusBarStyle]];
    switch (theStyle){
        case UIStatusBarStyleDefault:
        case UIStatusBarStyleLightContent:
            barStyle = theStyle;
            break;
        default:
            barStyle = UIStatusBarStyleDefault;
    }

    
    if (!isModal && (tab==nil)) {
        openAnimation = [[TiAnimation animationFromArg:args context:[self pageContext] create:NO] retain];
        [self rememberProxy:openAnimation];
    }
    //TODO Argument Processing
    id object = [self valueForUndefinedKey:@"orientationModes"];
    _supportedOrientations = [TiUtils TiOrientationFlagsFromObject:object];
    
    //GO ahead and call open on the UI thread
    TiThreadPerformOnMainThread(^{
        [self openOnUIThread:args];
    }, YES);
    
}

-(void)setStatusBarStyle:(id)style
{
    int theStyle = [TiUtils intValue:style def:[[[TiApp app] controller] defaultStatusBarStyle]];
    switch (theStyle){
        case UIStatusBarStyleDefault:
        case UIStatusBarStyleLightContent:
            barStyle = theStyle;
            break;
        default:
            barStyle = UIStatusBarStyleDefault;
    }
    [self setValue:NUMINT(barStyle) forUndefinedKey:@"statusBarStyle"];
    if(focussed) {
        TiThreadPerformOnMainThread(^{
            [[[TiApp app] controller] updateStatusBar];
        }, YES); 
    }
}

-(void)close:(id)args
{
    //I am not open. Go Away
    if (opening) {
        DebugLog(@"Window is opening. Ignoring this close call");
        return;
    }
    
    if (!opened) {
        DebugLog(@"Window is not open. Ignoring this close call");
        return;
    }
    
    if (closing) {
        DebugLog(@"Window is already closing. Ignoring this close call.");
        return;
    }
    
    if (tab != nil) {
        if ([args count] > 0) {
            args = [NSArray arrayWithObjects:self, [args objectAtIndex:0], nil];
        } else {
            args = [NSArray arrayWithObject:self];
        }
        [tab closeWindow:args];
        return;
    }
    
    closing = YES;
    
    //TODO Argument Processing
    closeAnimation = [[TiAnimation animationFromArg:args context:[self pageContext] create:NO] retain];
    [self rememberProxy:closeAnimation];

    //GO ahead and call close on UI thread
    TiThreadPerformOnMainThread(^{
        [self closeOnUIThread:args];
    }, YES);
    
}

-(BOOL)_handleOpen:(id)args
{
    TiRootViewController* theController = [[TiApp app] controller];
    if (isModal || (tab != nil) || self.isManaged) {
        [self forgetProxy:openAnimation];
        RELEASE_TO_NIL(openAnimation);
    }
    
    if ( (!self.isManaged) && (!isModal) && (openAnimation != nil) && ([theController topPresentedController] != [theController topContainerController]) ){
        DeveloperLog(@"[WARN] The top View controller is not a container controller. This window will open behind the presented controller without animations.")
        [self forgetProxy:openAnimation];
        RELEASE_TO_NIL(openAnimation);
    }
    
    return YES;
}

-(BOOL)_handleClose:(id)args
{
    TiRootViewController* theController = [[TiApp app] controller];
    if (isModal || (tab != nil) || self.isManaged) {
        [self forgetProxy:closeAnimation];
        RELEASE_TO_NIL(closeAnimation);
    }
    if ( (!self.isManaged) && (!isModal) && (closeAnimation != nil) && ([theController topPresentedController] != [theController topContainerController]) ){
        DeveloperLog(@"[WARN] The top View controller is not a container controller. This window will close behind the presented controller without animations.")
        [self forgetProxy:closeAnimation];
        RELEASE_TO_NIL(closeAnimation);
    }
    return YES;
}

-(BOOL)opening
{
    return opening;
}

-(BOOL)closing
{
    return closing;
}

-(void)setModal:(id)val
{
    [self replaceValue:val forKey:@"modal" notification:NO];
}

-(BOOL)isModal
{
    return isModal;
}

-(BOOL)hidesStatusBar
{
    return hidesStatusBar;
}

-(UIStatusBarStyle)preferredStatusBarStyle;
{
    return barStyle;
}

-(BOOL)handleFocusEvents
{
	return YES;
}

-(void)gainFocus
{
    if (focussed == NO) {
        focussed = YES;
        if ([self handleFocusEvents] && opened) {
            if ([self _hasListeners:@"focus"]) {
                [self fireEvent:@"focus" withObject:nil withSource:self propagate:NO reportSuccess:NO errorCode:0 message:nil];
            }
        }
        UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, nil);
        [[self view] setAccessibilityElementsHidden:NO];
    }
    TiThreadPerformOnMainThread(^{
        [self forceNavBarFrame];
    }, NO);

}

-(void)resignFocus
{
    if (focussed == YES) {
        focussed = NO;
        if ([self handleFocusEvents]) {
            if ([self _hasListeners:@"blur"]) {
                [self fireEvent:@"blur" withObject:nil withSource:self propagate:NO reportSuccess:NO errorCode:0 message:nil];
            }
        }
        [[self view] setAccessibilityElementsHidden:YES];
    }
}

-(UIViewController*)hostingController;
{
    if (controller == nil) {
        controller = [[TiViewController alloc] initWithViewProxy:self];
    }
    return controller;
}

#pragma mark - Private Methods
-(TiProxy*)tabGroup
{
    return [tab tabGroup];
}

-(NSNumber*)orientation
{
	return NUMINT([UIApplication sharedApplication].statusBarOrientation);
}

-(void)forceNavBarFrame
{
    if (!focussed) {
        return;
    }
    if ( (controller == nil) || ([controller navigationController] == nil) ) {
        return;
    }
    
    if (![[[TiApp app] controller] statusBarVisibilityChanged]) {
        return;
    }
    
    UINavigationController* nc = [controller navigationController];
    BOOL isHidden = [nc isNavigationBarHidden];
    [nc setNavigationBarHidden:!isHidden animated:NO];
    [nc setNavigationBarHidden:isHidden animated:NO];
    [[nc view] setNeedsLayout];
}


-(void)openOnUIThread:(NSArray*)args
{
    if ([self _handleOpen:args]) {
        [self parentWillShow];
        [self view];
        if (tab != nil) {
            if ([args count] > 0) {
                args = [NSArray arrayWithObjects:self, [args objectAtIndex:0], nil];
            } else {
                args = [NSArray arrayWithObject:self];
            }
            [tab openWindow:args];
        } else if (isModal) {
            UIViewController* theController = [self hostingController];
            [self windowWillOpen];
            NSDictionary *dict = [args count] > 0 ? [args objectAtIndex:0] : nil;
            int style = [TiUtils intValue:@"modalTransitionStyle" properties:dict def:-1];
            if (style != -1) {
                [theController setModalTransitionStyle:style];
            }
            style = [TiUtils intValue:@"modalStyle" properties:dict def:-1];
            if (style != -1) {
				// modal transition style page curl must be done only in fullscreen
				// so only allow if not page curl
				if ([theController modalTransitionStyle]!=UIModalTransitionStylePartialCurl)
				{
					[theController setModalPresentationStyle:style];
				}
            }
            BOOL animated = [TiUtils boolValue:@"animated" properties:dict def:YES];
            [[TiApp app] showModalController:theController animated:animated];
        } else {
            [self windowWillOpen];
            if ((self.isManaged == NO) && ((openAnimation == nil) || (![openAnimation isTransitionAnimation]))){
                [self attachViewToTopContainerController];
            }
            if (openAnimation != nil) {
                [openAnimation setDelegate:self];
                [openAnimation animate:self];
            } else {
                [self windowDidOpen];
            }
        }
    } else {
        DebugLog(@"[WARN] OPEN ABORTED. _handleOpen returned NO");
        opening = NO;
        opened = NO;
        [self forgetProxy:openAnimation];
        RELEASE_TO_NIL(openAnimation);
    }
}

-(void)closeOnUIThread:(NSArray *)args
{
    if ([self _handleClose:args]) {
        [self windowWillClose];
        if (isModal) {
            NSDictionary *dict = [args count] > 0 ? [args objectAtIndex:0] : nil;
            BOOL animated = [TiUtils boolValue:@"animated" properties:dict def:YES];
            [[TiApp app] hideModalController:controller animated:animated];
        } else {
            if (closeAnimation != nil) {
                [closeAnimation setDelegate:self];
                [closeAnimation animate:self];
            } else {
                [self windowDidClose];
            }
        }
        
    } else {
        DebugLog(@"[WARN] CLOSE ABORTED. _handleClose returned NO");
        closing = NO;
        RELEASE_TO_NIL(closeAnimation);
    }
}

#pragma mark - TiOrientationController
-(void)childOrientationControllerChangedFlags:(id<TiOrientationController>) orientationController;
{
    [parentController childOrientationControllerChangedFlags:self];
}

-(void)setParentOrientationController:(id <TiOrientationController>)newParent
{
    parentController = newParent;
}

-(id)parentOrientationController
{
	return parentController;
}

-(TiOrientationFlags) orientationFlags
{
    if ([self isModal]) {
        return (_supportedOrientations==TiOrientationNone) ? [[[TiApp app] controller] getDefaultOrientations] : _supportedOrientations;
    }
    return _supportedOrientations;
}


-(void)showNavBar:(NSArray*)args
{
    ENSURE_UI_THREAD(showNavBar,args);
    [self replaceValue:[NSNumber numberWithBool:NO] forKey:@"navBarHidden" notification:NO];
    if (controller!=nil)
    {
        id properties = (args!=nil && [args count] > 0) ? [args objectAtIndex:0] : nil;
        BOOL animated = [TiUtils boolValue:@"animated" properties:properties def:YES];
        [[controller navigationController] setNavigationBarHidden:NO animated:animated];
    }
}

-(void)hideNavBar:(NSArray*)args
{
    ENSURE_UI_THREAD(hideNavBar,args);
    [self replaceValue:[NSNumber numberWithBool:YES] forKey:@"navBarHidden" notification:NO];
    if (controller!=nil)
    {
        id properties = (args!=nil && [args count] > 0) ? [args objectAtIndex:0] : nil;
        BOOL animated = [TiUtils boolValue:@"animated" properties:properties def:YES];
        [[controller navigationController] setNavigationBarHidden:YES animated:animated];
        //TODO: need to fix height
    }
}


#pragma mark - Appearance and Rotation Callbacks. For subclasses to override.
//Containing controller will call these callbacks(appearance/rotation) on contained windows when it receives them.
-(void)viewWillAppear:(BOOL)animated
{
    id navBarHidden = [self valueForKey:@"navBarHidden"];
    if (navBarHidden!=nil) {
        id properties = [NSArray arrayWithObject:[NSDictionary dictionaryWithObject:[NSNumber numberWithBool:NO] forKey:@"animated"]];
        if ([TiUtils boolValue:navBarHidden]) {
            [self hideNavBar:properties];
        }
        else {
            [self showNavBar:properties];
        }
    }
    [self willShow];
}
-(void)viewWillDisappear:(BOOL)animated
{
    if (controller != nil) {
        [self resignFocus];
    }
    [self willHide];
}
-(void)viewDidAppear:(BOOL)animated
{
    if (isModal && opening) {
        [self windowDidOpen];
    }
    if (controller != nil && !self.isManaged) {
        [self gainFocus];
    }
}
-(void)viewDidDisappear:(BOOL)animated
{
    if (isModal && closing) {
        [self windowDidClose];
    }
}

-(void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
    //For various views (scrollableView, NavGroup etc this info neeeds to be forwarded)
    NSArray* childProxies = [self children];
	for (TiViewProxy * thisProxy in childProxies)
	{
		if ([thisProxy respondsToSelector:@selector(willAnimateRotationToInterfaceOrientation:duration:)])
		{
			[(id)thisProxy willAnimateRotationToInterfaceOrientation:toInterfaceOrientation duration:duration];
		}
	}
}

-(void)willRotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
    
}

-(void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
{
    
}


#pragma mark - TiAnimation Delegate Methods
-(BOOL)animationShouldTransition:(TiAnimation *)sender
{
    BOOL isOpenAnimation = NO;
    UIView* hostingView = nil;
    if (sender == openAnimation) {
        hostingView = [[[[TiApp app] controller] topContainerController] hostingView];
        isOpenAnimation = YES;
    } else {
        hostingView = [[self view] superview];
    }
    
    void (^animation)(void) = ^{
        if (isOpenAnimation) {
            RELEASE_TO_NIL(animatedOver);
            NSArray* subviews = [hostingView subviews];
            if ([subviews count] > 0) {
                animatedOver = [[subviews lastObject] retain];
            }
            if (animatedOver != nil) {
                [animatedOver removeFromSuperview];
            }
            [hostingView addSubview:[self view]];
        }
        else
        {
            [[self view] removeFromSuperview];
        }
    };

    [UIView transitionWithView:hostingView
                      duration:[(TiAnimation*)sender animationDuration]
                       options:[[(TiAnimation*)sender transition] intValue]
                    animations:animation
                    completion:^(BOOL finished) {
                        [sender animationCompleted:[NSString stringWithFormat:@"%@",hostingView]
                                          finished:[NSNumber numberWithBool:finished]
                                           context:sender];
                    }
     ];

    return NO;
}

-(void)animationDidComplete:(TiAnimation *)sender
{
    if (sender == openAnimation) {
        if (animatedOver != nil) {
            if ([animatedOver isKindOfClass:[TiUIView class]]) {
                TiViewProxy* theProxy = (TiViewProxy*)[(TiUIView*)animatedOver proxy];
                if ([theProxy viewAttached]) {
                    [[[self view] superview] insertSubview:animatedOver belowSubview:[self view]];
#ifndef TI_USE_AUTOLAYOUT
                    LayoutConstraint* layoutProps = [theProxy layoutProperties];
                    ApplyConstraintToViewWithBounds(layoutProps, (TiUIView*)animatedOver, [[animatedOver superview] bounds]);
#endif
                    [theProxy layoutChildren:NO];
                    RELEASE_TO_NIL(animatedOver);
                }
            } else {
                [[[self view] superview] insertSubview:animatedOver belowSubview:[self view]];
            }
        }
        [self windowDidOpen];
    } else {
        [self windowDidClose];
    }
}
#ifdef USE_TI_UIIOSTRANSITIONANIMATION
-(TiUIiOSTransitionAnimationProxy*)transitionAnimation
{
    return transitionProxy;
}

-(void)setTransitionAnimation:(id)args
{
    ENSURE_SINGLE_ARG_OR_NIL(args, TiUIiOSTransitionAnimationProxy)
    if(transitionProxy != nil) {
        [self forgetProxy:transitionProxy];
        RELEASE_TO_NIL(transitionProxy)
    }
    transitionProxy = [args retain];
    [self rememberProxy:transitionProxy];
}
#endif

@end
