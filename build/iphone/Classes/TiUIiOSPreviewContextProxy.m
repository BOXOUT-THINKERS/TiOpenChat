/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#if IS_XCODE_7
#ifdef USE_TI_UIIOSPREVIEWCONTEXT
#import "TiUIiOSPreviewContextProxy.h"
#import "TiUIListView.h"
#import "TiUITableView.h"
#import "TiUIScrollView.h"

@implementation TiUIiOSPreviewContextProxy

-(void)_initWithProperties:(NSDictionary *)properties
{
    if ([TiUtils forceTouchSupported] == NO) {
        NSLog(@"[WARN] 3DTouch is not available on this device.");
        return;
    }
    
    [self setPreview:[properties valueForKey:@"preview"]];
    [self setContentHeight:[TiUtils intValue:@"contentHeight" def:0]];
    [self setActions:[NSMutableArray arrayWithArray:[properties valueForKey:@"actions"]]];
        
    [super _initWithProperties:properties];
}

-(void)setActions:(NSMutableArray *)actions
{
    for (TiProxy* proxy in _actions) {
        if ([proxy isKindOfClass:[TiProxy class]]) {
            [self forgetProxy:proxy];
        }
    }
    
    for (TiProxy* proxy in _actions) {
        if ([proxy isKindOfClass:[TiProxy class]]) {
            [self rememberProxy:proxy];
        }
    }
    _actions = [actions retain];
}

-(void)dealloc
{
    for (TiProxy* proxy in _actions) {
        if ([proxy isKindOfClass:[TiProxy class]]) {
            [self forgetProxy:proxy];
        }
    }
    
    RELEASE_TO_NIL(_preview);
    RELEASE_TO_NIL(_actions);
    
    [super dealloc];
}

-(void)connectToDelegate
{
    UIView *nativeSourceView = nil;
    
#ifdef USE_TI_UILISTVIEW
    if ([[_sourceView view] isKindOfClass:[TiUIListView class]]) {
        nativeSourceView = [(TiUIListView*)[_sourceView view] tableView];
    }
#else
#ifdef USE_TI_UITABLEVIEW
    if([[_sourceView view] isKindOfClass:[TiUITableView class]]) {
        nativeSourceView = [(TiUITableView*)[_sourceView view] tableView];
    }
#else
#ifdef USE_TI_UISCROLLVIEW
    if([[_sourceView view] isKindOfClass:[TiUIScrollView class]]) {
        nativeSourceView = [(TiUIScrollView*)[_sourceView view] scrollView];
    }
#endif
#endif
#endif
    
    if (nativeSourceView == nil) {
        nativeSourceView = [_sourceView view];
    }
    
    UIViewController *controller = [[[TiApp app] controller] topPresentedController];
    [controller registerForPreviewingWithDelegate:[[TiPreviewingDelegate alloc] initWithPreviewContext:self]
                                       sourceView:nativeSourceView];
}

@end
#endif
#endif