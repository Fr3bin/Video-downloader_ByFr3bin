import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { detectPlatform, escapeUrl, formatDuration } from '@/lib/video-utils';
import { YT_DLP_PATH, TIMEOUTS, QUALITY_OPTIONS } from '@/lib/constants';
import { VideoInfo, VideoInfoRequest } from '@/lib/types';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { url }: VideoInfoRequest = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);

    if (!platform) {
      return NextResponse.json(
        { error: 'Unsupported platform. Please use YouTube or TikTok URLs.' },
        { status: 400 }
      );
    }

    let videoInfo: VideoInfo;

    if (platform === 'youtube') {
      videoInfo = await getYouTubeInfo(url);
    } else {
      videoInfo = await getTikTokInfo(url);
    }

    return NextResponse.json(videoInfo);
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}

async function getYouTubeInfo(url: string): Promise<VideoInfo> {
  try {
    const escapedUrl = escapeUrl(url);
    
    // Get basic video info only (skip format list for speed)
    const infoCmd = `${YT_DLP_PATH} --print "%(title)s|||%(thumbnail)s|||%(duration)s" --no-warnings --no-playlist "${escapedUrl}"`;
    const { stdout: infoOutput } = await execAsync(infoCmd, {
      timeout: TIMEOUTS.VIDEO_INFO
    });

    const [title, thumbnail, durationStr] = infoOutput.trim().split('|||');
    const duration = parseInt(durationStr) || 0;

    // Return standard quality options immediately (no need to check formats)
    // These formats are available on virtually all YouTube videos
    const formats = QUALITY_OPTIONS.map(opt => ({
      ...opt,
      url: '',
      hasAudio: false,
      hasVideo: true,
    }));

    return {
      title: title || 'Video',
      thumbnail: thumbnail || '',
      duration: formatDuration(duration),
      formats: formats,
      platform: 'youtube',
    };
  } catch (error: any) {
    console.error('YouTube fetch error details:', error);
    throw new Error('Failed to fetch YouTube video information. Please check the URL and try again.');
  }
}

async function getTikTokInfo(url: string): Promise<VideoInfo> {
  // TikTok support placeholder
  throw new Error('TikTok support is coming soon!');
}
