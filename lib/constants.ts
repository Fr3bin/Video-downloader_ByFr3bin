/**
 * Constants used throughout the application
 */

export const YT_DLP_PATH = '/opt/homebrew/bin/yt-dlp';

export const ALLOWED_QUALITIES = ['480', '720', '1080'] as const;

export const QUALITY_OPTIONS = [
  { quality: '1080p', format: 'video', container: 'mp4', formatId: '1080' },
  { quality: '720p', format: 'video', container: 'mp4', formatId: '720' },
  { quality: '480p', format: 'video', container: 'mp4', formatId: '480' },
] as const;

export const TIMEOUTS = {
  VIDEO_INFO: 10000,      // 10 seconds
  CODEC_CHECK: 10000,     // 10 seconds
  DOWNLOAD: 120000,       // 2 minutes (stream copy)
  REENCODE: 300000,       // 5 minutes (re-encoding)
} as const;

export const BUFFER_SIZE = 1024 * 1024 * 100; // 100MB
