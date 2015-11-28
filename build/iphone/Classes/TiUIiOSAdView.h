/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#import "TiUIView.h"

#ifdef USE_TI_UIIOSADVIEW

#import "TiUIiOSAdViewProxy.h"
#import <iAd/iAd.h>

@interface TiUIiOSAdView : TiUIView<ADBannerViewDelegate> {

@private
	ADBannerView *adview;
}

@property (nonatomic, readonly) ADBannerView* adview;

#pragma mark - TiOpenChat Internal Use
-(CGFloat)contentHeightForWidth:(CGFloat)value;
-(CGFloat)contentWidthForWidth:(CGFloat)value;
@end

#endif
