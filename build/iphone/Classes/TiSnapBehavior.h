/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIIOSANIMATOR
#ifdef USE_TI_UIIOSSNAPBEHAVIOR
#import "TiProxy.h"
#import "TiViewProxy.h"
#import "TiAnimatorProxy.h"
@interface TiSnapBehavior : TiProxy <TiBehaviorProtocol> {
    TiViewProxy* _snapItem;
    CGFloat _damping;
    CGPoint _snapPoint;
    BOOL _needsRefresh;
    UISnapBehavior* _snapBehavior;
}

#pragma mark - Public API

-(TiViewProxy*) item;
-(void) setItem:(id)args;
-(NSNumber*)damping;
-(void) setDamping:(id)args;
-(NSDictionary*) snapPoint;
-(void) setSnapPoint:(id)args;

@end
#endif
#endif
