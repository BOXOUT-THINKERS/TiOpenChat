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

#import "TiUIiOSPreviewActionProxy.h"

@implementation TiUIiOSPreviewActionProxy

-(void)_initWithProperties:(NSDictionary *)properties
{
    [self setTitle:[TiUtils stringValue:[properties valueForKey:@"title"]]];
    [self setStyle:[TiUtils intValue:[properties valueForKey:@"style"] def:UIPreviewActionStyleDefault]];
    
    [super _initWithProperties:properties];
}
                  
-(void)dealloc
{
    RELEASE_TO_NIL(action);
    
    [super dealloc];
}

-(NSString*)apiName
{
    return @"Ti.UI.iOS.PreviewAction";
}

-(UIPreviewAction*)action
{
    if (action == nil) {
        action = [UIPreviewAction actionWithTitle:[self title] style:[self style] handler:^void(UIPreviewAction *_action, UIViewController *_controller) {
            if ([self _hasListeners:@"click"]) {
                [self fireEventWithAction:_action];
            }
        }];
    }
    
    return action;
}

-(void)fireEventWithAction:(UIPreviewAction*)action
{
    NSMutableDictionary *event = [[NSMutableDictionary alloc] initWithDictionary:@{
        @"index" : NUMINT([self actionIndex]),
        @"title" : [self title],
        @"style" : NUMINT([self style])
    }];
    
    if ([self listViewEvent] != nil) {
        [event setValue:NUMINTEGER([TiUtils intValue:[[self listViewEvent] valueForKey:@"sectionIndex"]]) forKey:@"sectionIndex"];
        [event setValue:NUMINTEGER([TiUtils intValue:[[self listViewEvent] valueForKey:@"itemIndex"]]) forKey:@"itemIndex"];
        [event setValue:[[self listViewEvent] valueForKey:@"itemId"] forKey:@"itemId"];
    }
    
    [self fireEvent:@"click" withObject:event];
    RELEASE_TO_NIL(event);
}

@end
#endif
#endif