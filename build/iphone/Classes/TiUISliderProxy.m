/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UISLIDER

#import "TiUISliderProxy.h"

NSArray* sliderKeySequence;

@implementation TiUISliderProxy

-(NSArray *)keySequence
{
	if (sliderKeySequence == nil)
	{
		sliderKeySequence = [[NSArray arrayWithObjects:@"min",@"max",@"value",@"leftTrackLeftCap",@"leftTrackTopCap",@"rightTrackLeftCap",@"rightTrackTopCap",
                              @"leftTrackImage",@"selectedLeftTrackImage", @"highlightedLeftTrackImage", @"disabledLeftTrackImage",
                              @"rightTrackImage",@"selectedRightTrackImage", @"highlightedRightTrackImage", @"disabledRightTrackImage",nil] retain];
	}
	return sliderKeySequence;
}

-(NSString*)apiName
{
    return @"Ti.UI.Slider";
}

-(void)_initWithProperties:(NSDictionary *)properties
{
    [self initializeProperty:@"leftTrackLeftCap" defaultValue:NUMFLOAT(1.0)];
    [self initializeProperty:@"leftTrackTopCap" defaultValue:NUMFLOAT(1.0)];
    [self initializeProperty:@"rightTrackLeftCap" defaultValue:NUMFLOAT(1.0)];
    [self initializeProperty:@"rightTrackTopCap" defaultValue:NUMFLOAT(1.0)];
    [self initializeProperty:@"enabled" defaultValue:NUMBOOL(YES)];
    [super _initWithProperties:properties];
}


-(UIViewAutoresizing)verifyAutoresizing:(UIViewAutoresizing)suggestedResizing
{
	return suggestedResizing & ~UIViewAutoresizingFlexibleHeight;
}

-(TiDimension)defaultAutoHeightBehavior:(id)unused
{
    return TiDimensionAutoSize;
}


USE_VIEW_FOR_VERIFY_HEIGHT

@end

#endif