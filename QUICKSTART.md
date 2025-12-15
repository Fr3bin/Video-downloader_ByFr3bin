# 🚀 Quick Start Guide

## Run the Application

### Option 1: Using the start script (Recommended)
```bash
./start.sh
```

### Option 2: Using npm
```bash
npm run dev
```

### Option 3: Using npx
```bash
npx next dev
```

## Access the Application
Once the server is running, open your browser and navigate to:
**http://localhost:3000**

## Testing the Downloader

### YouTube Examples:
Try these sample YouTube URLs:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://www.youtube.com/watch?v=jNQXAC9IVRw`

### Steps:
1. Paste a YouTube URL in the input field
2. Click "Fetch Info" button
3. Wait for the video information to load
4. Switch between "Video" and "Audio Only" tabs
5. Select your preferred quality
6. Click "Download Video" or "Download Audio"

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```bash
PORT=3001 npm run dev
```

### Dependencies Not Installed
```bash
npm install
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

## Building for Production

```bash
npm run build
npm run start
```

## Notes
- YouTube downloads work out of the box
- TikTok support requires additional API integration (see README.md)
- Some videos may be restricted by YouTube's terms of service
- Downloads are streamed directly to your device
