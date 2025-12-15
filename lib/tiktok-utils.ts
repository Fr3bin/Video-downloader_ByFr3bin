import { exec } from 'child_process';
import { promisify } from 'util';
import { YT_DLP_PATH, TIMEOUTS } from './constants';
import { VideoInfo } from './types';

const execAsync = promisify(exec);

/**
 * Get TikTok video information
 */
export async function getTikTokInfo(url: string): Promise<VideoInfo> {
  try {
    const escapedUrl = url.replace(/"/g, '\\"');
    
    // Get basic video info
    const infoCmd = `${YT_DLP_PATH} --print "%(title)s|||%(thumbnail)s|||%(duration)s" --no-warnings "${escapedUrl}"`;
    const { stdout: infoOutput } = await execAsync(infoCmd, {
      timeout: TIMEOUTS.VIDEO_INFO
    });

    const [title, thumbnail, durationStr] = infoOutput.trim().split('|||');
    const duration = parseInt(durationStr) || 0;

    // TikTok videos are typically available in one quality
    const formats = [
      {
        quality: 'HD',
        format: 'video',
        url: '',
        hasAudio: true,
        hasVideo: true,
        container: 'mp4',
        formatId: 'best',
      },
    ];

    return {
      title: title || 'TikTok Video',
      thumbnail: thumbnail || '',
      duration: formatDuration(duration),
      formats: formats,
      platform: 'tiktok',
    };
  } catch (error: any) {
    console.error('TikTok fetch error:', error);
    throw new Error('Failed to fetch TikTok video information. Please check the URL and try again.');
  }
}

/**
 * Format duration helper
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
