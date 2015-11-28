/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#import "TiProxy.h"

#ifdef USE_TI_CALENDAR

#import <EventKit/EventKit.h>

@class CalendarModule;

@interface TiCalendarCalendar : TiProxy {
@private
    EKCalendar* calendar;
    NSString* calendarId;
    
    CalendarModule* module;
}


@property(readonly, nonatomic) EKCalendar* calendar;
-(id)_initWithPageContext:(id<TiEvaluator>)context calendar:(EKCalendar*)calendar_ module:(CalendarModule*)module_;

@end

#endif
