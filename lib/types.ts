/**
 * Type definitions for video downloader application
 */

export interface VideoFormat {
  quality: string;
  format: string;
  url: string;
  hasAudio: boolean;
  hasVideo: boolean;
  container: string;
  formatId: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: VideoFormat[];
  platform: 'youtube' | 'tiktok';
}

export type Platform = 'youtube' | 'tiktok' | null;

export interface DownloadRequest {
  url: string;
  quality?: string;
  format?: 'video' | 'audio';
}

export interface VideoInfoRequest {
  url: string;
}

export interface CodecInfo {
  vcodec: string;
  acodec: string;
  needsReencode: boolean;
}
