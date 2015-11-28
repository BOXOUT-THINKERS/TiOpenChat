/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIIOSANIMATOR
#ifdef USE_TI_UIIOSPUSHBEHAVIOR
#import "TiProxy.h"
#import "TiViewProxy.h"
#import "TiAnimatorProxy.h"
@interface TiPushBehavior : TiProxy <TiBehaviorProtocol> {
    BOOL _active;
    CGFloat _angle;
    CGFloat _magnitude;
    CGVector _vector;
    UIPushBehavior* _pushBehavior;
    UIPushBehaviorMode _mode;
    NSMutableArray* _items;
    BOOL _needsRefresh;
    BOOL _vectorDefined;
}

#pragma mark - Public API
-(void)addItem:(id)args;
-(void)removeItem:(id)args;
-(NSArray*)items;
-(void)setAngle:(id)args;
-(NSNumber*)angle;
-(void)setMagnitude:(id)args;
-(NSNumber*)magnitude;
-(void)setPushDirection:(id)args;
-(NSDictionary*)pushDirection;
-(void)setPushMode:(id)args;
-(NSNumber*)pushMode;
-(void)setActive:(id)args;
-(NSNumber*)active;
@end
#endif
#endif
