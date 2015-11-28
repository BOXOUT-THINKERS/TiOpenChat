/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_UITABLEVIEW

#import "TiViewProxy.h"
#import "TiDimension.h"

@class TiUITableViewCell;
@class TiUITableView;
@class TiUITableViewSectionProxy;

@interface TiUITableViewRowProxy : TiViewProxy <TiProxyDelegate>
{
@private
	NSString *tableClass;
	TiUITableView *table;
	TiUITableViewSectionProxy *section;
	TiDimension height;
	TiDimension leftCap;
	TiDimension topCap;
	BOOL configuredChildren;
	int dirtyRowFlags;
	UIView * rowContainerView;
	BOOL modifyingRow;
	BOOL attaching;
	NSInteger row;
	TiUITableViewCell* callbackCell;
}

#pragma mark Public APIs

@property(nonatomic,readonly)	NSString *tableClass;
@property(nonatomic, readonly) BOOL reusable; // Readonly until reproxy/reuse implemented properly

#pragma mark Framework

@property(nonatomic,readwrite,assign) TiUITableView *table;
@property(nonatomic,readwrite,assign) TiUITableViewSectionProxy *section;
@property(nonatomic,readwrite,assign) NSInteger row;
@property(nonatomic,readwrite,assign) TiUITableViewCell* callbackCell;

-(void)prepareTableRowForReuse;
-(void)initializeTableViewCell:(UITableViewCell*)cell;
-(CGFloat)sizeWidthForDecorations:(CGFloat)oldWidth forceResizing:(BOOL)force;
-(CGFloat)rowHeight:(CGFloat)width;
-(TiProxy *)touchedViewProxyInCell:(UITableViewCell *)targetCell atPoint:(CGPoint*)point;
-(id)createEventObject:(id)initialObject;
-(void)triggerAttach;
-(void)updateRow:(NSDictionary*)data withObject:(NSDictionary*)properties;
-(UIView*) currentRowContainerView; //Private method :For internal use only.
-(void)triggerLayout; //Private method :For internal use only. Called from layoutSubviews of the cell.

@end

#endif
