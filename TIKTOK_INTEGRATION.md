# 🎵 TikTok Integration Guide

## Overview
The current implementation has the structure ready for TikTok support. To enable full TikTok downloading functionality, you'll need to integrate with a TikTok API service.

## Recommended API Services

### 1. RapidAPI - TikTok Downloader
- **URL**: https://rapidapi.com/yi005/api/tiktok-download-without-watermark
- **Features**: Download without watermark, HD quality
- **Pricing**: Free tier available

### 2. TikAPI
- **URL**: https://tikapi.io/
- **Features**: Comprehensive TikTok API
- **Pricing**: Various plans available

### 3. SocialMediaAPI
- **URL**: https://rapidapi.com/social-media-api/api/social-media-api
- **Features**: Multiple platform support
- **Pricing**: Free tier available

## Implementation Steps

### Step 1: Get API Key
1. Sign up for your chosen API service
2. Subscribe to their TikTok downloader endpoint
3. Copy your API key

### Step 2: Add Environment Variable
Create a `.env.local` file in the project root:
```env
TIKTOK_API_KEY=your_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=tiktok-download-without-watermark.p.rapidapi.com
```

### Step 3: Update API Route
Edit `app/api/video-info/route.ts` and replace the `getTikTokInfo` function:

```typescript
async function getTikTokInfo(url: string): Promise<VideoInfo> {
  try {
    const response = await axios.get('https://tiktok-download-without-watermark.p.rapidapi.com/analysis', {
      params: { url },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!
      }
    });

    const data = response.data.data;
    
    return {
      title: data.title || 'TikTok Video',
      thumbnail: data.cover || '',
      duration: formatDuration(data.duration || 0),
      formats: [
        {
          quality: 'HD',
          format: 'video',
          url: data.hdplay || data.play,
          hasAudio: true,
          hasVideo: true,
          container: 'mp4',
        },
        {
          quality: 'Audio Only',
          format: 'audio',
          url: data.music || data.play,
          hasAudio: true,
          hasVideo: false,
          container: 'mp3',
        },
      ],
      platform: 'tiktok',
    };
  } catch (error: any) {
    throw new Error(`TikTok error: ${error.message}`);
  }
}
```

### Step 4: Update Download Route
Edit `app/api/download/route.ts` to handle TikTok downloads:

```typescript
// Add inside the POST function, after YouTube handling
if (url.includes('tiktok.com')) {
  const response = await axios.get('https://tiktok-download-without-watermark.p.rapidapi.com/analysis', {
    params: { url },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!
    }
  });

  const data = response.data.data;
  const downloadUrl = format === 'audio' ? data.music : (data.hdplay || data.play);
  
  return NextResponse.json({
    downloadUrl,
    filename: `tiktok_${Date.now()}.${format === 'audio' ? 'mp3' : 'mp4'}`,
  });
}
```

### Step 5: Install Axios (if not already installed)
```bash
npm install axios
```

### Step 6: Test
1. Restart your development server
2. Try a TikTok URL
3. Verify downloads work correctly

## Alternative: Using ytdl-core for TikTok
Some community forks of ytdl-core support TikTok. Check:
- https://github.com/distube/ytdl-core
- Look for TikTok support in the documentation

## Security Notes
- Never commit API keys to version control
- Use `.env.local` for local development
- Use environment variables in production (Vercel, etc.)
- Add `.env.local` to your `.gitignore`

## Rate Limiting
Most APIs have rate limits. Consider:
- Implementing request caching
- Adding user-based rate limiting
- Upgrading to paid plans for production use

## Testing TikTok URLs
Example TikTok URLs to test:
- `https://www.tiktok.com/@username/video/1234567890`
- `https://vm.tiktok.com/shortcode/`

## Troubleshooting

### "API key not valid"
- Verify your API key is correct
- Check if you've subscribed to the endpoint
- Ensure environment variables are loaded

### "Rate limit exceeded"
- Wait for the rate limit to reset
- Consider upgrading your plan
- Implement caching

### "Video not found"
- Verify the TikTok URL is correct and public
- Some private videos cannot be downloaded
- Check if the video is region-locked

## Future Enhancements
- Add support for TikTok playlists
- Implement watermark removal options
- Add thumbnail preview for TikTok videos
- Support for TikTok live streams
