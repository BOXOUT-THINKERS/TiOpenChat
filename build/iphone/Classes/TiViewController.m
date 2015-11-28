/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */

#import "TiViewController.h"
#import "TiApp.h"

@implementation TiViewController

-(id)initWithViewProxy:(TiViewProxy*)window
{
    if (self = [super init]) {
        _proxy = window;
        [self updateOrientations];
        [TiUtils configureController:self withObject:_proxy];
    }
    return self;
}

-(void)dealloc
{
    [super dealloc];
}

#if IS_XCODE_7
-(NSArray<id<UIPreviewActionItem>> *)previewActionItems
{
    if ([self previewActions] == nil) {
        [self setPreviewActions:[NSArray array]];
    }
    
    return [self previewActions];
}
#endif

-(void)updateOrientations
{
    id object = [_proxy valueForUndefinedKey:@"orientationModes"];
    _supportedOrientations = [TiUtils TiOrientationFlagsFromObject:object];
    if (_supportedOrientations == TiOrientationNone) {
        _supportedOrientations = [[[TiApp app] controller] getDefaultOrientations];
    }
}

-(TiViewProxy*) proxy
{
    return _proxy;
}

#ifdef DEVELOPER
- (void)viewWillLayoutSubviews
{
    CGRect bounds = [[self view] bounds];
    NSLog(@"TIVIEWCONTROLLER WILL LAYOUT SUBVIEWS %.1f %.1f",bounds.size.width, bounds.size.height);
    [super viewWillLayoutSubviews];
}
#endif

- (void)viewDidLayoutSubviews
{
#ifdef DEVELOPER
    CGRect bounds = [[self view] bounds];
    NSLog(@"TIVIEWCONTROLLER DID LAYOUT SUBVIEWS %.1f %.1f",bounds.size.width, bounds.size.height);
#endif
    if (!CGRectEqualToRect([_proxy sandboxBounds], [[self view] bounds])) {
        [_proxy parentSizeWillChange];
    }
    [super viewDidLayoutSubviews];
}

//IOS5 support. Begin Section. Drop in 3.2
- (BOOL)automaticallyForwardAppearanceAndRotationMethodsToChildViewControllers
{
    return YES;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
{
    return TI_ORIENTATION_ALLOWED(_supportedOrientations,toInterfaceOrientation) ? YES : NO;
}
//IOS5 support. End Section


//IOS6 new stuff.
- (BOOL)shouldAutomaticallyForwardRotationMethods
{
    return YES;
}

- (BOOL)shouldAutomaticallyForwardAppearanceMethods
{
    return YES;
}

- (BOOL)shouldAutorotate{
    return YES;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    /*
     If we are in a navigation controller, let us match so it doesn't get freaked 
     out in when pushing/popping. We are going to force orientation anyways.
     */
    if ([self navigationController] != nil) {
        return [[self navigationController] supportedInterfaceOrientations];
    }
    //This would be for modal.
    return (UIInterfaceOrientationMask)_supportedOrientations;
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation
{
    return [[[TiApp app] controller] lastValidOrientation:_supportedOrientations];
}

-(void)loadView
{
    if (_proxy == nil) {
        DebugLog(@"NO PROXY ASSOCIATED WITH VIEWCONTROLLER. RETURNING")
        return;
    }
    [self updateOrientations];
    [self setHidesBottomBarWhenPushed:[TiUtils boolValue:[_proxy valueForUndefinedKey:@"tabBarHidden"] def:NO]];
    //Always wrap proxy view with a wrapperView.
    //This way proxy always has correct sandbox when laying out
    [_proxy parentWillShow];
    UIView *wrapperView = [[UIView alloc] initWithFrame:[[UIScreen mainScreen] applicationFrame]];
    wrapperView.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    [wrapperView addSubview:[_proxy view]];
    [wrapperView bringSubviewToFront:[_proxy view]];
    self.view = wrapperView;
    [wrapperView release];
}

#pragma mark - Appearance & rotation methods

-(void)viewWillAppear:(BOOL)animated
{
    [_proxy parentWillShow];
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy viewWillAppear:animated];
    }
    [super viewWillAppear:animated];
}
-(void)viewWillDisappear:(BOOL)animated
{
    [_proxy parentWillHide];
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy viewWillDisappear:animated];
    }
    [super viewWillDisappear:animated];
}
-(void)viewDidAppear:(BOOL)animated
{
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy viewDidAppear:animated];
    }
    [super viewDidAppear:animated];
}
-(void)viewDidDisappear:(BOOL)animated
{
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy viewDidDisappear:animated];
    }
    [super viewDidDisappear:animated];
}
-(void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy willAnimateRotationToInterfaceOrientation:toInterfaceOrientation duration:duration];
    }
    [super willAnimateRotationToInterfaceOrientation:toInterfaceOrientation duration:duration];
}
-(void)willRotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration
{
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy willRotateToInterfaceOrientation:toInterfaceOrientation duration:duration];
    }
    [super willRotateToInterfaceOrientation:toInterfaceOrientation duration:duration];
}
-(void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
{
   	if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        [(id<TiWindowProtocol>)_proxy didRotateFromInterfaceOrientation:fromInterfaceOrientation];
    }
    [super didRotateFromInterfaceOrientation:fromInterfaceOrientation];
}

#pragma mark - Status Bar Appearance

- (BOOL)prefersStatusBarHidden
{
    if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        return [(id<TiWindowProtocol>)_proxy hidesStatusBar];
    } else {
        return NO;
    }
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    if ([_proxy conformsToProtocol:@protocol(TiWindowProtocol)]) {
        return [(id<TiWindowProtocol>)_proxy preferredStatusBarStyle];
    } else if ([[[TiApp app] controller] topContainerController] != nil) {
        // Prefer the style of the most recent view controller.
        return [[[[TiApp app] controller] topContainerController] preferredStatusBarStyle];
    } else {
        return UIStatusBarStyleDefault;
    }
}

-(BOOL) modalPresentationCapturesStatusBarAppearance
{
    return YES;
}

- (UIStatusBarAnimation)preferredStatusBarUpdateAnimation
{
    return UIStatusBarAnimationNone;
}
- (BOOL)disablesAutomaticKeyboardDismissal {
    return NO;
}
@end
