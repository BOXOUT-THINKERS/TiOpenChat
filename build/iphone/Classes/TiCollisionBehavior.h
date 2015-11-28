/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIIOSANIMATOR
#ifdef USE_TI_UIIOSCOLLISIONBEHAVIOR
#import "TiProxy.h"
#import "TiAnimatorProxy.h"
@interface TiCollisionBehavior : TiProxy  <TiBehaviorProtocol, UICollisionBehaviorDelegate> {
    NSMutableArray* _items;
    NSMutableArray* _identifiers;
    NSMutableArray* _boundaries;
    UICollisionBehavior* _collisionBehavior;
    UICollisionBehaviorMode _mode;
    UIEdgeInsets _insets;
    BOOL _treatReferenceAsBoundary;
    BOOL _needsRefresh;
}
#pragma mark - Public API
-(void)addItem:(id)args;
-(void)removeItem:(id)args;
-(NSArray*)items;
-(NSArray*)boundaryIdentifiers;
-(void)addBoundary:(id)args;
-(void)removeBoundary:(id)args;
-(void)removeAllBoundaries:(id)unused;
-(void)setTreatReferenceAsBoundary:(id)args;
-(NSNumber*)treatReferenceAsBoundary;
-(void)setReferenceInsets:(id)args;
-(NSDictionary*)referenceInsets;
-(void)setCollisionMode:(id)args;
-(NSNumber*)collisionMode;
@end
#endif
#endif
