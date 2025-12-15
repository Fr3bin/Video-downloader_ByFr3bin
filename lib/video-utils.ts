import { exec } from 'child_process';
import { promisify } from 'util';
import { YT_DLP_PATH, TIMEOUTS } from './constants';
import { CodecInfo } from './types';

const execAsync = promisify(exec);

/**
 * Sanitize filename for safe file system operations
 */
export function sanitizeFilename(filename: string): string {
  const cleaned = filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid filesystem characters
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters (emojis, special unicode)
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim() // Remove leading/trailing whitespace
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/^_+/, '') // Remove leading underscores
    .replace(/\.+$/g, '') // Remove trailing dots
    .replace(/_+$/g, '') // Remove trailing underscores
    .substring(0, 200); // Increase length limit for better readability
  
  return cleaned || 'video'; // Fallback if filename becomes empty
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): 'youtube' | 'tiktok' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  return null;
}

/**
 * Escape URL for shell command
 */
export function escapeUrl(url: string): string {
  return url.replace(/"/g, '\\"');
}

/**
 * Get video title from URL
 */
export async function getVideoTitle(url: string): Promise<string> {
  try {
    const escapedUrl = escapeUrl(url);
    const titleCmd = `${YT_DLP_PATH} --print "%(title)s" --no-warnings --no-playlist "${escapedUrl}"`;
    const { stdout } = await execAsync(titleCmd, { timeout: TIMEOUTS.VIDEO_INFO });
    const sanitized = sanitizeFilename(stdout.trim());
    return sanitized ? `${sanitized}.mp4` : 'video.mp4';
  } catch (error) {
    console.warn('Could not fetch title:', error);
    return 'video.mp4';
  }
}

/**
 * Check video codec compatibility with QuickTime
 */
export async function checkCodecCompatibility(
  url: string,
  formatSelection: string
): Promise<CodecInfo> {
  try {
    const escapedUrl = escapeUrl(url);
    const codecCmd = `${YT_DLP_PATH} --print "%(vcodec)s|||%(acodec)s" -f "${formatSelection}" --no-warnings --no-playlist "${escapedUrl}"`;
    const { stdout: codecInfo } = await execAsync(codecCmd, { timeout: TIMEOUTS.CODEC_CHECK });
    
    const [vcodec, acodec] = codecInfo.trim().split('|||');
    const isH264 = vcodec.includes('avc') || vcodec.includes('h264');
    const isAAC = acodec.includes('aac') || acodec.includes('mp4a');
    const needsReencode = !isH264 || !isAAC;
    
    console.log(`Video codec: ${vcodec}, Audio codec: ${acodec}, Needs re-encode: ${needsReencode}`);
    
    return { vcodec, acodec, needsReencode };
  } catch (error) {
    console.warn('Could not detect codec, assuming re-encoding needed:', error);
    return { vcodec: 'unknown', acodec: 'unknown', needsReencode: true };
  }
}

/**
 * Build format selection string for yt-dlp
 */
export function buildFormatSelection(quality?: string, format?: 'video' | 'audio'): string {
  // STRONGLY prefer H.264 video and AAC audio to avoid re-encoding
  // Explicitly exclude AV1 (av01) and VP9 codecs, prefer AAC over Opus
  
  if (format === 'audio') {
    return 'bestaudio[ext=m4a][acodec=aac]/bestaudio[acodec=aac]/bestaudio[ext=m4a]';
  }
  
  if (!quality) {
    return 'best[ext=mp4][vcodec^=avc][acodec=aac]/best[ext=mp4][vcodec^=avc][acodec^=mp4a]/best[ext=mp4][vcodec!*=av01][vcodec!*=vp9][acodec=aac]';
  }
  
  const height = parseInt(quality);
  if (isNaN(height)) {
    return 'best[ext=mp4][vcodec^=avc][acodec=aac]';
  }
  
  if (height <= 360) {
    return `best[height=${height}][ext=mp4][vcodec^=avc][acodec=aac]/best[height<=${height}][ext=mp4][vcodec^=avc][acodec^=mp4a]/best[height<=${height}][ext=mp4][vcodec!*=av01][vcodec!*=vp9]`;
  }
  
  return `bestvideo[height=${height}][ext=mp4][vcodec^=avc]+bestaudio[acodec=aac]/bestvideo[height=${height}][vcodec^=avc]+bestaudio[acodec^=mp4a]/bestvideo[height<=${height}][vcodec!*=av01][vcodec!*=vp9]+bestaudio[acodec=aac]/bestvideo[height<=${height}][vcodec!*=av01][vcodec!*=vp9]+bestaudio[acodec!*=opus]`;
}
