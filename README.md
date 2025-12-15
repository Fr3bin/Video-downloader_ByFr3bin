# 🎬 Video Downloader by Fr3bin

A modern, fast, and user-friendly web application for downloading YouTube videos with high-quality output and QuickTime compatibility on macOS.

![Video Downloader Banner](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- 🚀 **Lightning Fast** - Optimized video info fetching (~1 second)
- 🎯 **Smart Quality Selection** - 480p, 720p, and 1080p options
- 🎨 **Modern UI** - Beautiful gradient design with Tailwind CSS
- 🖥️ **Mac Optimized** - Full QuickTime Player compatibility
- ⚡ **Intelligent Encoding** - Only re-encodes when necessary
- 🎵 **Audio Support** - Download audio-only files
- 📱 **Responsive Design** - Works on all screen sizes
- 🔄 **Real-time Progress** - Visual feedback during downloads

## 🛠️ Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Video Processing:** yt-dlp + ffmpeg
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org/))
- **yt-dlp** (Download tool for videos)
- **ffmpeg** (Video processing)

### Install yt-dlp and ffmpeg on macOS:

```bash
# Using Homebrew
brew install yt-dlp ffmpeg
```

### On other platforms:

- **yt-dlp:** [Installation Guide](https://github.com/yt-dlp/yt-dlp#installation)
- **ffmpeg:** [Download](https://ffmpeg.org/download.html)

## 🚀 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Fr3bin/Video-downloader_ByFr3bin.git
cd Video-downloader_ByFr3bin
```

2. **Install dependencies:**

```bash
npm install
```

3. **Update yt-dlp path (if needed):**

If yt-dlp is not installed at `/opt/homebrew/bin/yt-dlp`, update the path in `lib/constants.ts`:

```typescript
export const YT_DLP_PATH = 'your/path/to/yt-dlp';
```

4. **Run the development server:**

```bash
npm run dev
```

5. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Paste a YouTube URL** into the input field
2. **Click "Get Video Info"** to fetch available qualities
3. **Select your preferred quality** (480p, 720p, or 1080p)
4. **Click "Download"** and wait for the video to process
5. **Enjoy your video!** - Fully compatible with QuickTime Player

## 🎯 How It Works

### Smart Codec Detection

The app intelligently detects video codecs and only re-encodes when necessary:

- ✅ **H.264/AAC videos** → Stream copy (5-15 seconds, no CPU strain)
- 🔄 **AV1/VP9/Opus videos** → Re-encode (30-60 seconds for compatibility)

### Quality Options

- **480p** - Smallest file size, good for mobile
- **720p** - Balanced quality and size
- **1080p** - Best quality for desktop viewing

All downloads are optimized for QuickTime Player compatibility with the `faststart` flag for instant playback.

## 📁 Project Structure

```
video-downloader/
├── app/
│   ├── api/
│   │   ├── download/       # Video download endpoint
│   │   └── video-info/     # Video info fetching
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── VideoDownloader.tsx # Main component
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── constants.ts        # App constants
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utility functions
│   └── video-utils.ts      # Video processing utilities
└── public/                 # Static assets
```

## ⚙️ Configuration

### Timeouts

Adjust timeouts in `lib/constants.ts`:

```typescript
export const TIMEOUTS = {
  VIDEO_INFO: 10000,      // 10 seconds
  CODEC_CHECK: 10000,     // 10 seconds
  DOWNLOAD: 120000,       // 2 minutes (stream copy)
  REENCODE: 300000,       // 5 minutes (re-encoding)
};
```

### Quality Options

Modify available qualities in `lib/constants.ts`:

```typescript
export const ALLOWED_QUALITIES = ['480', '720', '1080'];
```

## 🐛 Troubleshooting

### "Command not found: yt-dlp"

- Ensure yt-dlp is installed: `brew install yt-dlp`
- Update `YT_DLP_PATH` in `lib/constants.ts` to match your installation path

### "This file contains media which isn't compatible with QuickTime Player"

- This should not happen with the current setup, but if it does:
- Check that ffmpeg is installed: `ffmpeg -version`
- The app will automatically re-encode incompatible videos

### Slow downloads

- Check your internet connection
- Videos with AV1/VP9 codecs require re-encoding (slower)
- Most H.264 videos download quickly with stream copy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Fr3bin**

- GitHub: [@Fr3bin](https://github.com/Fr3bin)

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Amazing video download tool
- [ffmpeg](https://ffmpeg.org/) - Powerful video processing
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org/) - The React Framework

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect copyright laws and terms of service of video platforms. Only download videos that you have the right to download.

---

Made with ❤️ by Fr3bin
