'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Link2, Loader2, Video, Music, Youtube, Check, AlertCircle } from 'lucide-react';

interface VideoFormat {
  quality: string;
  format: string;
  url: string;
  hasAudio: boolean;
  hasVideo: boolean;
  container: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  formats: VideoFormat[];
  platform: 'youtube' | 'tiktok';
}

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video info');
      }

      setVideoInfo(data);
      // Auto-select first format
      const formats = data.formats.filter((f: VideoFormat) => 
        downloadType === 'audio' ? f.format === 'audio' : f.format === 'video'
      );
      if (formats.length > 0) {
        setSelectedFormat(formats[0].quality);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedFormat) {
      setError('Please select a quality option');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          quality: selectedFormat,
          format: downloadType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process download');
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'video.mp4';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

    } catch (err: any) {
      setError(err.message || 'Failed to download video');
    } finally {
      setDownloading(false);
    }
  };

  const getAvailableFormats = () => {
    if (!videoInfo) return [];
    return videoInfo.formats.filter(f => 
      downloadType === 'audio' ? f.format === 'audio' : f.format === 'video'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Video className="h-12 w-12 text-purple-400 mr-3" />
            <h1 className="text-5xl font-bold text-white">Video Downloader</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Download videos from YouTube and TikTok in various resolutions
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Badge variant="secondary" className="bg-red-600/20 text-red-300 border-red-500/50">
              <Youtube className="h-3 w-3 mr-1" />
              YouTube
            </Badge>
            <Badge variant="secondary" className="bg-cyan-600/20 text-cyan-300 border-cyan-500/50">
              TikTok (Coming Soon)
            </Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Paste Video URL</CardTitle>
            <CardDescription className="text-slate-400">
              Enter a YouTube or TikTok video URL to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-white">Video URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="url"
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchVideoInfo()}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button 
                  onClick={fetchVideoInfo}
                  disabled={loading || !url.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Fetch Info
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Video Info */}
            {videoInfo && (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Thumbnail and Info */}
                <div className="flex gap-4 p-4 bg-slate-700/30 rounded-lg">
                  {videoInfo.thumbnail && (
                    <img 
                      src={videoInfo.thumbnail} 
                      alt={videoInfo.title}
                      className="w-40 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold line-clamp-2">{videoInfo.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">Duration: {videoInfo.duration}</p>
                    <Badge className="mt-2 bg-purple-600/20 text-purple-300 border-purple-500/50">
                      {videoInfo.platform}
                    </Badge>
                  </div>
                </div>

                {/* Download Type Tabs */}
                <Tabs value={downloadType} onValueChange={(v) => setDownloadType(v as 'video' | 'audio')}>
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                    <TabsTrigger value="video" className="data-[state=active]:bg-purple-600">
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="data-[state=active]:bg-purple-600">
                      <Music className="h-4 w-4 mr-2" />
                      Audio Only
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="video" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Select Quality</Label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Choose quality" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {getAvailableFormats().map((format) => (
                            <SelectItem 
                              key={format.quality} 
                              value={format.quality}
                              className="text-white focus:bg-purple-600 focus:text-white"
                            >
                              {format.quality} - {format.container}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="audio" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Audio Quality</Label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Choose quality" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {getAvailableFormats().map((format) => (
                            <SelectItem 
                              key={format.quality} 
                              value={format.quality}
                              className="text-white focus:bg-purple-600 focus:text-white"
                            >
                              {format.quality} - {format.container}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Download Button */}
                <Button 
                  onClick={handleDownload}
                  disabled={downloading || !selectedFormat}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg"
                  size="lg"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download {downloadType === 'audio' ? 'Audio' : 'Video'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="border-slate-700 bg-slate-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Multiple Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Support for YouTube and TikTok with more coming soon</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Various Resolutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Choose from multiple quality options for your downloads</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Audio Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm">Download audio-only files from videos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
