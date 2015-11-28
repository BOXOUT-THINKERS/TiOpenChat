/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */


#import <UIKit/UIKit.h>

/**
 The class representing a font.
 */
@interface WebFont : NSObject {
	NSString* family;
	CGFloat size;
    BOOL isSemiboldWeight;
	BOOL isBoldWeight;
	BOOL isNormalWeight;
    BOOL isItalicStyle;
    BOOL isNormalStyle;
	UIFont *font;
    
    NSString* textStyle;
}

/**
 Provides access to the font family which is the official font name.
 @see http://developer.appcelerator.com/apidoc/mobile/latest/Font-object.html
 */
@property(nonatomic,retain) NSString *family;

/**
 Provides access to the font size.
 */
@property(nonatomic) CGFloat size;

/**
 Whether or not the font size is not set.
 @return _YES_ if the font size is not set, _NO_ otherwise.
 */
@property(nonatomic,readonly) BOOL isSizeNotSet;

/**
 Whether or not the font weight is bold.
 */
@property(nonatomic) BOOL isBoldWeight;

/**
 Whether or not the font weight is normal.
 */
@property(nonatomic) BOOL isNormalWeight;

/**
 Whether or not the font style is italic.
 */
@property(nonatomic) BOOL isItalicStyle;

/**
 Whether or not the font style is normal.
 */
@property(nonatomic) BOOL isNormalStyle;

/**
 Whether or not the font weight is semibold.
 */
@property(nonatomic) BOOL isSemiboldWeight;

/**
 Provides access to the Text Style.
 */
@property(nonatomic, readonly) NSString *textStyle;
/**
 Returns underlying font object.
 @return The font
 */
-(UIFont*)font;

/**
 Tells the font to update its parameters from dictionary.
 @param fontDict The dictionary to update from.
 @param inheritedFont The font to inherit parameters from.
 @return _YES_ if the update operation succeeded, _NO_ otherwise.
 */
-(BOOL)updateWithDict:(NSDictionary *)fontDict inherits:(WebFont *)inheritedFont;
/**
 Indicates if the style specified by the string is a valid value for textStyle
 @param theStyle The String to check 
 @return _YES_ is it is a valid value for textStyle, _NO_ otherwise
 */
-(BOOL)isValidTextStyle:(NSString*)theStyle;
/**
 Returns table row font.
 @return The table row font.
 */
+(WebFont *)tableRowFont;

/**
 Returns the default text font.
 @return The default font.
 */
+(WebFont *)defaultFont;

/**
 Returns the default bold font.
 @return The default bold font.
 */
+(WebFont *)defaultBoldFont;

/**
 Returns the font by name.
 @param name The web font name.
 @return The web font.
 */
+(WebFont *)fontWithName:(NSString*)name;

@end

