/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIIOSSPLITWINDOW
#import "TiUIWindow.h"

@interface TiUIiOSSplitWindow : TiUIWindow {
@private
    UIView* masterViewWrapper;
    UIView* detailViewWrapper;
    BOOL showMasterInPortrait;
    BOOL masterIsOverlayed;
    BOOL viewsInitialized;
    
    TiViewProxy *masterProxy;
    TiViewProxy *detailProxy;
    
    float splitRatioPortrait;
    float splitRatioLandscape;
}


#pragma mark - Titanim Internal Use Only
-(void)setShowMasterInPortrait_:(id)value withObject:(id)animated;
-(void)setMasterIsOverlayed_:(id)value withObject:(id)animated;
-(void)initWrappers;
-(void)cleanup;
@end
#endif
