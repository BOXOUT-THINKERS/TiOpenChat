/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIIPHONESYSTEMBUTTONSTYLE

#import "TiUIiPhoneSystemButtonStyleProxy.h"
#import "TiBase.h"

@implementation TiUIiPhoneSystemButtonStyleProxy

-(NSString*)apiName
{
    return @"Ti.UI.iPhone.SystemButtonStyle";
}


MAKE_SYSTEM_PROP(DONE,UIBarButtonItemStyleDone);
MAKE_SYSTEM_PROP(BORDERED,UIBarButtonItemStyleBordered);
MAKE_SYSTEM_PROP(PLAIN,UIBarButtonItemStylePlain);
MAKE_SYSTEM_PROP_DEPRECATED_REMOVED(BAR,2,@"UI.iPhone.SystemButtonStyle.BAR",@"3.4.2",@"3.6.0");

@end

#endif