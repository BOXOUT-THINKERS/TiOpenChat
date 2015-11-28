/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UIIPHONE

#import "TiUIiPhoneProxy.h"
#import "TiUtils.h"
#import "TiApp.h"


#ifdef USE_TI_UIIPHONEANIMATIONSTYLE
	#import "TiUIiPhoneAnimationStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONESTATUSBAR
	#import "TiUIiPhoneStatusBarProxy.h"
#endif
#ifdef USE_TI_UIIPHONEROWANIMATIONSTYLE
	#import "TiUIiPhoneRowAnimationStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTONSTYLE
	#import "TiUIiPhoneSystemButtonStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTON
	#import "TiUIiPhoneSystemButtonProxy.h"
#endif
#ifdef USE_TI_UIIPHONEPROGRESSBARSTYLE
	#import "TiUIiPhoneProgressBarStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONEACTIVITYINDICATORSTYLE
	#import "TiUIiPhoneActivityIndicatorStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONESYSTEMICON
	#import "TiUIiPhoneSystemIconProxy.h"
#endif
#ifdef USE_TI_UIIPHONESCROLLINDICATORSTYLE
	#import "TiUIiPhoneScrollIndicatorStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSTYLE
	#import "TiUIiPhoneTableViewStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSEPARATORSTYLE
	#import "TiUIiPhoneTableViewSeparatorStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSCROLLPOSITION
	#import "TiUIiPhoneTableViewScrollPositionProxy.h"
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWCELLSELECTIONSTYLE
	#import "TiUIiPhoneTableViewCellSelectionStyleProxy.h"
#endif
#ifdef USE_TI_UIIPAD
	#import "TiUIiPadProxy.h"
#endif
#ifdef USE_TI_UIIPADPOPOVER
	#import "TiUIiPadPopoverProxy.h"
#endif
#ifdef USE_TI_UIIPADSPLITWINDOW
	#import "TiUIiPadSplitWindowProxy.h"
#endif
#ifdef USE_TI_UIIPHONEALERTDIALOGSTYLE
 	#import "TiUIiPhoneAlertDialogStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSTYLE
	#import "TiUIiPhoneTableViewStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSCROLLPOSITION
	#import "TiUIiPhoneTableViewScrollPositionProxy.h"
#endif
#ifdef USE_TI_UIIPHONELISTVIEWCELLSELECTIONSTYLE
#import "TiUIiPhoneTableViewCellSelectionStyleProxy.h"
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSEPARATORSTYLE
#import "TiUIiPhoneTableViewSeparatorStyleProxy.h"
#endif

@implementation TiUIiPhoneProxy

#define FORGET_AND_RELEASE(x) \
{\
[self forgetProxy:x]; \
RELEASE_TO_NIL(x); \
}

-(void)dealloc
{
#ifdef USE_TI_UIIPHONEANIMATIONSTYLE
	FORGET_AND_RELEASE(animationStyle);
#endif
#ifdef USE_TI_UIIPHONESTATUSBAR	
	FORGET_AND_RELEASE(statusBar);
#endif
#ifdef USE_TI_UIIPHONEROWANIMATIONSTYLE
	FORGET_AND_RELEASE(rowAnimationStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTONSTYLE
	FORGET_AND_RELEASE(systemButtonStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTON
	FORGET_AND_RELEASE(systemButton);
#endif
#ifdef USE_TI_UIIPHONEPROGRESSBARSTYLE
	FORGET_AND_RELEASE(progressBarStyle);
#endif
#ifdef USE_TI_UIIPHONEACTIVITYINDICATORSTYLE
	FORGET_AND_RELEASE(activityIndicatorStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMICON
	FORGET_AND_RELEASE(systemIcon);
#endif
#ifdef USE_TI_UIIPHONESCROLLINDICATORSTYLE
	FORGET_AND_RELEASE(scrollIndicatorStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSTYLE
	FORGET_AND_RELEASE(tableViewStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSEPARATORSTYLE
	FORGET_AND_RELEASE(tableViewSeparatorStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSCROLLPOSITION
	FORGET_AND_RELEASE(tableViewScrollPosition);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWCELLSELECTIONSTYLE
	FORGET_AND_RELEASE(tableViewCellSelectionStyle);
#endif
#ifdef USE_TI_UIIPHONEALERTDIALOGSTYLE
	FORGET_AND_RELEASE(alertDialogStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSTYLE
	FORGET_AND_RELEASE(listViewStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSCROLLPOSITION
	FORGET_AND_RELEASE(listViewScrollPosition);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWCELLSELECTIONSTYLE
	FORGET_AND_RELEASE(listViewCellSelectionStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSEPARATORSTYLE
	FORGET_AND_RELEASE(listViewSeparatorStyle);
#endif
	[super dealloc];
}

#define DEFINE_SUBPROXY(methodName,ivarName)	\
-(TiProxy*)methodName	\
{	\
	if (ivarName==nil)	\
	{	\
		ivarName = [[TiUIiPhone##methodName##Proxy alloc] _initWithPageContext:[self executionContext]];	\
        [self rememberProxy:ivarName]; \
	}	\
	return ivarName;	\
}	\

#define DEFINE_SUBPROXY_AS(methodName,className, ivarName)	\
-(TiProxy*)methodName	\
{	\
	if (ivarName==nil)	\
	{	\
		ivarName = [[TiUIiPhone##className##Proxy alloc] _initWithPageContext:[self executionContext]];	\
		[self rememberProxy:ivarName]; \
	}	\
	return ivarName;	\
}	\

#ifdef USE_TI_UIIPHONEANIMATIONSTYLE
	DEFINE_SUBPROXY(AnimationStyle,animationStyle);
#endif
#ifdef USE_TI_UIIPHONESTATUSBAR
	DEFINE_SUBPROXY(StatusBar,statusBar);
#endif
#ifdef USE_TI_UIIPHONEROWANIMATIONSTYLE
	DEFINE_SUBPROXY(RowAnimationStyle,rowAnimationStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTONSTYLE
	DEFINE_SUBPROXY(SystemButtonStyle,systemButtonStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTON
	DEFINE_SUBPROXY(SystemButton,systemButton);
#endif
#ifdef USE_TI_UIIPHONEPROGRESSBARSTYLE
	DEFINE_SUBPROXY(ProgressBarStyle,progressBarStyle);
#endif
#ifdef USE_TI_UIIPHONEACTIVITYINDICATORSTYLE
	DEFINE_SUBPROXY(ActivityIndicatorStyle,activityIndicatorStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMICON
	DEFINE_SUBPROXY(SystemIcon,systemIcon);
#endif
#ifdef USE_TI_UIIPHONESCROLLINDICATORSTYLE
	DEFINE_SUBPROXY(ScrollIndicatorStyle,scrollIndicatorStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSTYLE
	DEFINE_SUBPROXY(TableViewStyle,tableViewStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSEPARATORSTYLE
	DEFINE_SUBPROXY(TableViewSeparatorStyle,tableViewSeparatorStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSCROLLPOSITION
	DEFINE_SUBPROXY(TableViewScrollPosition,tableViewScrollPosition);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWCELLSELECTIONSTYLE
	DEFINE_SUBPROXY(TableViewCellSelectionStyle,tableViewCellSelectionStyle);
#endif
#ifdef USE_TI_UIIPHONEALERTDIALOGSTYLE
	DEFINE_SUBPROXY(AlertDialogStyle, alertDialogStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSTYLE
DEFINE_SUBPROXY_AS(ListViewStyle,TableViewStyle, listViewStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSCROLLPOSITION
DEFINE_SUBPROXY_AS(ListViewScrollPosition, TableViewScrollPosition, listViewScrollPosition);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWCELLSELECTIONSTYLE
DEFINE_SUBPROXY_AS(ListViewCellSelectionStyle, TableViewCellSelectionStyle, listViewCellSelectionStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSEPARATORSTYLE
DEFINE_SUBPROXY_AS(ListViewSeparatorStyle, TableViewSeparatorStyle, listViewSeparatorStyle);
#endif

-(NSString*)apiName
{
    return @"Ti.UI.iPhone";
}

BEGIN_UI_THREAD_PROTECTED_VALUE(statusBarHidden,NSNumber)
result = [NSNumber numberWithBool:[[UIApplication sharedApplication] isStatusBarHidden]];
END_UI_THREAD_PROTECTED_VALUE(statusBarHidden)

BEGIN_UI_THREAD_PROTECTED_VALUE(statusBarStyle,NSNumber)
result = [NSNumber numberWithInt:[[UIApplication sharedApplication] statusBarStyle]];
END_UI_THREAD_PROTECTED_VALUE(statusBarStyle)

-(void)setAppBadge:(id)value
{
	ENSURE_UI_THREAD(setAppBadge,value);
	if (value == [NSNull null])
	{
		[[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
	}
	else
	{
		[[UIApplication sharedApplication] setApplicationIconBadgeNumber:[TiUtils intValue:value]];
	}
}

BEGIN_UI_THREAD_PROTECTED_VALUE(appBadge,NSNumber)
result = [NSNumber numberWithInteger:[[UIApplication sharedApplication] applicationIconBadgeNumber]];
END_UI_THREAD_PROTECTED_VALUE(appBadge)

-(void)setAppSupportsShakeToEdit:(NSNumber *)shake
{
	ENSURE_UI_THREAD(setAppSupportsShakeToEdit,shake);
	[[UIApplication sharedApplication] setApplicationSupportsShakeToEdit:[shake boolValue]];
}

BEGIN_UI_THREAD_PROTECTED_VALUE(appSupportsShakeToEdit,NSNumber)
result = [NSNumber numberWithBool:[[UIApplication sharedApplication] applicationSupportsShakeToEdit]];
END_UI_THREAD_PROTECTED_VALUE(appSupportsShakeToEdit)


MAKE_SYSTEM_PROP(MODAL_TRANSITION_STYLE_COVER_VERTICAL,UIModalTransitionStyleCoverVertical);
MAKE_SYSTEM_PROP(MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL,UIModalTransitionStyleFlipHorizontal);
MAKE_SYSTEM_PROP(MODAL_TRANSITION_STYLE_CROSS_DISSOLVE,UIModalTransitionStyleCrossDissolve);



MAKE_SYSTEM_PROP(MODAL_PRESENTATION_FULLSCREEN,UIModalPresentationFullScreen);
MAKE_SYSTEM_PROP(MODAL_TRANSITION_STYLE_PARTIAL_CURL,UIModalTransitionStylePartialCurl);
MAKE_SYSTEM_PROP(MODAL_PRESENTATION_PAGESHEET,UIModalPresentationPageSheet);
MAKE_SYSTEM_PROP(MODAL_PRESENTATION_FORMSHEET,UIModalPresentationFormSheet);
MAKE_SYSTEM_PROP(MODAL_PRESENTATION_CURRENT_CONTEXT,UIModalPresentationCurrentContext);



#pragma mark Internal

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
#ifdef USE_TI_UIIPHONEANIMATIONSTYLE
	FORGET_AND_RELEASE(animationStyle);
#endif
#ifdef USE_TI_UIIPHONESTATUSBAR
	FORGET_AND_RELEASE(statusBar);
#endif
#ifdef USE_TI_UIIPHONEROWANIMATIONSTYLE
	FORGET_AND_RELEASE(rowAnimationStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTONSTYLE
	FORGET_AND_RELEASE(systemButtonStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMBUTTON
	FORGET_AND_RELEASE(systemButton);
#endif
#ifdef USE_TI_UIIPHONEPROGRESSBARSTYLE
	FORGET_AND_RELEASE(progressBarStyle);
#endif
#ifdef USE_TI_UIIPHONEACTIVITYINDICATORSTYLE
	FORGET_AND_RELEASE(activityIndicatorStyle);
#endif
#ifdef USE_TI_UIIPHONESYSTEMICON
	FORGET_AND_RELEASE(systemIcon);
#endif
#ifdef USE_TI_UIIPHONESCROLLINDICATORSTYLE
	FORGET_AND_RELEASE(scrollIndicatorStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSTYLE
	FORGET_AND_RELEASE(tableViewStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSEPARATORSTYLE
	FORGET_AND_RELEASE(tableViewSeparatorStyle);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWSCROLLPOSITION
	FORGET_AND_RELEASE(tableViewScrollPosition);
#endif
#ifdef USE_TI_UIIPHONETABLEVIEWCELLSELECTIONSTYLE
	FORGET_AND_RELEASE(tableViewCellSelectionStyle);
#endif
#ifdef USE_TI_UIIPHONEALERTDIALOGSTYLE
	FORGET_AND_RELEASE(alertDialogStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSTYLE
	FORGET_AND_RELEASE(listViewStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSCROLLPOSITION
	FORGET_AND_RELEASE(listViewScrollPosition);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWCELLSELECTIONSTYLE
	FORGET_AND_RELEASE(listViewCellSelectionStyle);
#endif
#ifdef USE_TI_UIIPHONELISTVIEWSEPARATORSTYLE
	FORGET_AND_RELEASE(listViewSeparatorStyle);
#endif
	[super didReceiveMemoryWarning:notification];
}

@end

#endif