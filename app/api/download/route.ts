import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  getVideoTitle, 
  checkCodecCompatibility, 
  buildFormatSelection,
  escapeUrl,
  detectPlatform 
} from '@/lib/video-utils';
import { YT_DLP_PATH, TIMEOUTS, BUFFER_SIZE } from '@/lib/constants';
import { DownloadRequest } from '@/lib/types';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { url, quality, format }: DownloadRequest = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);

    if (platform === 'youtube') {
      return await handleYouTubeDownload(url, quality, format);
    }

    return NextResponse.json(
      { error: 'Platform not yet fully supported' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process download' },
      { status: 500 }
    );
  }
}

async function handleYouTubeDownload(
  url: string,
  quality?: string,
  format?: 'video' | 'audio'
): Promise<NextResponse> {
  const escapedUrl = escapeUrl(url);
  const formatSelection = buildFormatSelection(quality, format);
  const mergeOutput = format === 'audio' ? 'm4a' : 'mp4';
  
  // Create temporary file path
  const tmpDir = os.tmpdir();
  const tmpFilePath = path.join(tmpDir, `video_${Date.now()}.${mergeOutput}`);

  try {
    // Get video title
    const filename = await getVideoTitle(url);

    // Check codec compatibility
    const codecInfo = await checkCodecCompatibility(url, formatSelection);

    // Build download command
    const downloadCmd = buildDownloadCommand(
      formatSelection,
      mergeOutput,
      tmpFilePath,
      escapedUrl,
      codecInfo.needsReencode
    );

    // Execute download
    console.log(codecInfo.needsReencode ? 'Re-encoding video for QuickTime compatibility...' : 'Using stream copy (no re-encoding)...');
    
    await execAsync(downloadCmd, {
      maxBuffer: BUFFER_SIZE,
      timeout: codecInfo.needsReencode ? TIMEOUTS.REENCODE : TIMEOUTS.DOWNLOAD
    });

    console.log('yt-dlp completed');

    // Find and read the downloaded file
    const finalFilePath = await findDownloadedFile(tmpFilePath);
    const videoBuffer = fs.readFileSync(finalFilePath);

    // Clean up temp files
    cleanupTempFiles(tmpFilePath);

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': format === 'audio' ? 'audio/mp4' : 'video/mp4',
        'Content-Length': videoBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    cleanupTempFiles(tmpFilePath);
    console.error('Download error:', error);
    throw new Error(error.message || 'Failed to download video. The format may not be available or the video is restricted.');
  }
}

function buildDownloadCommand(
  formatSelection: string,
  mergeOutput: string,
  tmpFilePath: string,
  escapedUrl: string,
  needsReencode: boolean
): string {
  const baseCmd = `${YT_DLP_PATH} -f "${formatSelection}" --no-warnings --no-playlist --merge-output-format ${mergeOutput}`;
  
  if (needsReencode) {
    // Re-encode to H.264/AAC for guaranteed compatibility
    return `${baseCmd} --postprocessor-args "ffmpeg:-c:v libx264 -preset ultrafast -crf 23 -c:a aac -b:a 192k -movflags +faststart" -o "${tmpFilePath}" "${escapedUrl}"`;
  } else {
    // Stream copy (no re-encoding) - fast!
    return `${baseCmd} --postprocessor-args "ffmpeg:-c copy -movflags +faststart" -o "${tmpFilePath}" "${escapedUrl}"`;
  }
}

async function findDownloadedFile(tmpFilePath: string): Promise<string> {
  // Check if file exists with expected path
  if (fs.existsSync(tmpFilePath)) {
    return tmpFilePath;
  }

  // Try common extensions
  const extensions = ['.mp4', '.mkv', '.webm'];
  for (const ext of extensions) {
    const filePath = `${tmpFilePath}${ext}`;
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // List all files in temp directory that start with our base name
  const tmpDir = path.dirname(tmpFilePath);
  const baseName = path.basename(tmpFilePath);
  const files = fs.readdirSync(tmpDir).filter(f => f.startsWith(baseName));
  
  if (files.length > 0) {
    return path.join(tmpDir, files[0]);
  }

  console.error('Expected file not found. Files in temp dir:', files);
  throw new Error('Download completed but merged file was not found. The video may require ffmpeg for merging.');
}

function cleanupTempFiles(tmpFilePath: string): void {
  try {
    const tmpDir = path.dirname(tmpFilePath);
    const baseName = path.basename(tmpFilePath);
    const files = fs.readdirSync(tmpDir).filter(f => f.startsWith(baseName));
    
    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(tmpDir, file));
      } catch (error) {
        console.warn('Failed to delete temp file:', file);
      }
    });
  } catch (error) {
    console.warn('Failed to cleanup temp files:', error);
  }
}
