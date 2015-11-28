/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2015 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 * 
 * WARNING: This is generated code. Modify at your own risk and without support.
 */
#ifdef USE_TI_MEDIA

#import "TiProxy.h"
#import "TiFile.h"
#import <AVFoundation/AVAudioRecorder.h>

typedef enum
{
    RecordStarted = 0,
    RecordStopped = 1,
    RecordPaused = 2
} RecorderState;

@interface TiMediaAudioRecorderProxy : TiProxy<AVAudioRecorderDelegate> {
@private
    AVAudioRecorder *recorder;
    TiFile *file;
    NSNumber *compression;
    NSNumber *format;
    RecorderState curState;
}

#pragma mark Public APIs

@property(nonatomic,readonly) NSNumber* recording;
@property(nonatomic,readonly) NSNumber* stopped;
@property(nonatomic,readonly) NSNumber* paused;
@property(nonatomic,readwrite,retain) NSNumber *compression;
@property(nonatomic,readwrite,retain) NSNumber *format;

-(void)pause:(id)args;
-(void)resume:(id)args;
-(void)start:(id)args;
-(id)stop:(id)args;

@end

#endif
