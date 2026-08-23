---
name: sa-youtube-cli
description: >
  YouTube intelligence CLI for Space Age AI Solutions. Search YouTube, extract full
  transcripts, pull chapter breakdowns, download videos for analysis, scrape channel
  content, and feed everything into the workflow copier or cinematic-website-builder.
  AUTO-TRIGGER when user pastes a YouTube URL and wants to extract, analyze, search,
  download, or learn from it. Trigger on: any youtube.com or youtu.be URL, "search youtube",
  "get transcript", "download this video", "pull captions", "youtube channel", "find videos about".
source: yt-dlp + youtube-transcript-api + pytubefix
requires: yt-dlp, youtube-transcript-api, ffmpeg (all pre-installed on VPS)
---

# SA-YouTube-CLI — YouTube Intelligence for Space Age Agents

Full YouTube data extraction layer. Transcripts, metadata, chapters, search, channel scraping, frame extraction. Feeds directly into sa-workflow-copier and sa-watch.

---

## Install (VPS One-Time Setup)

```bash
pip install yt-dlp youtube-transcript-api pytubefix --break-system-packages
# yt-dlp update (run weekly)
yt-dlp -U
```

---

## Core Commands

### 1. Get Full Transcript

```bash
# Plain text transcript — fastest, best for workflow extraction
python3 - << 'EOF'
from youtube_transcript_api import YouTubeTranscriptApi
import sys, json, re

url = "YOUTUBE_URL_HERE"
video_id = re.search(r"(?:v=|youtu\.be/)([^&\n?#]+)", url).group(1)

try:
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    full_text = " ".join([t['text'] for t in transcript])
    
    # Also save with timestamps
    timestamped = [f"[{int(t['start']//60)}:{int(t['start']%60):02d}] {t['text']}" 
                   for t in transcript]
    
    print("=== FULL TRANSCRIPT ===")
    print(full_text)
    print("\n=== TIMESTAMPED ===")
    print("\n".join(timestamped))
except Exception as e:
    print(f"ERROR: {e}")
    print("Trying auto-generated captions via yt-dlp...")
EOF
```

### 2. Get Video Metadata + Chapters

```bash
yt-dlp --no-check-certificate --skip-download -j "YOUTUBE_URL" | python3 - << 'EOF'
import sys, json
d = json.load(sys.stdin)
print(f"TITLE: {d['title']}")
print(f"CHANNEL: {d['channel']}")
print(f"DURATION: {d['duration']}s ({d['duration']//60}m)")
print(f"VIEWS: {d.get('view_count', 'N/A')}")
print(f"UPLOAD DATE: {d.get('upload_date', 'N/A')}")
print(f"\nDESCRIPTION:\n{d.get('description', '')[:500]}")
print(f"\nCHAPTERS:")
for ch in (d.get('chapters') or []):
    print(f"  [{int(ch['start_time']//60)}:{int(ch['start_time']%60):02d}] {ch['title']}")
EOF
```

### 3. Download Video for Frame Analysis

```bash
# Download best quality for Claude frame extraction
yt-dlp --no-check-certificate \
  -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" \
  --merge-output-format mp4 \
  -o "/home/video_analysis/%(title)s.%(ext)s" \
  "YOUTUBE_URL"

# Download audio only (for transcript via Whisper)
yt-dlp --no-check-certificate \
  -x --audio-format mp3 \
  -o "/home/video_analysis/%(title)s.%(ext)s" \
  "YOUTUBE_URL"
```

### 4. Extract Auto-Captions (yt-dlp fallback)

```bash
yt-dlp --no-check-certificate \
  --skip-download \
  --write-auto-sub \
  --sub-lang en \
  --sub-format vtt \
  -o "/tmp/%(title)s" \
  "YOUTUBE_URL"

# Convert VTT to clean text
python3 << 'EOF'
import re, glob
files = glob.glob("/tmp/*.vtt")
for f in files:
    text = open(f).read()
    # Strip VTT formatting
    clean = re.sub(r'\d{2}:\d{2}:\d{2}\.\d{3} --> .*\n', '', text)
    clean = re.sub(r'<[^>]+>', '', clean)
    clean = re.sub(r'\n{3,}', '\n\n', clean)
    print(clean[:3000])
EOF
```

### 5. Search YouTube for Build Videos

```bash
# Search and return top 10 results with metadata
yt-dlp --no-check-certificate \
  "ytsearch10:website builder tutorial cinematic scroll GSAP 2026" \
  --skip-download \
  -j --flat-playlist | python3 << 'EOF'
import sys, json
for line in sys.stdin:
    try:
        d = json.loads(line)
        print(f"• {d.get('title', 'N/A')}")
        print(f"  URL: https://youtube.com/watch?v={d.get('id')}")
        print(f"  Duration: {d.get('duration', 'N/A')}s | Views: {d.get('view_count', 'N/A')}")
        print()
    except: pass
EOF
```

### 6. Scrape Full Channel

```bash
# Get all videos from a channel
yt-dlp --no-check-certificate \
  --skip-download \
  -j --flat-playlist \
  "https://www.youtube.com/@CHANNEL_NAME/videos" | python3 << 'EOF'
import sys, json
videos = []
for line in sys.stdin:
    try:
        d = json.loads(line)
        videos.append({
            "title": d.get('title'),
            "url": f"https://youtube.com/watch?v={d.get('id')}",
            "duration": d.get('duration'),
            "upload_date": d.get('upload_date')
        })
    except: pass
print(f"Total videos: {len(videos)}")
for v in videos[:20]:
    print(f"• {v['title']} — {v['url']}")
EOF
```

### 7. Batch Transcript Extraction

```bash
# Extract transcripts from multiple videos in a playlist
python3 << 'EOF'
from youtube_transcript_api import YouTubeTranscriptApi
import re, os

urls = [
    "URL_1",
    "URL_2",
    "URL_3"
]

os.makedirs("/home/transcripts", exist_ok=True)

for url in urls:
    video_id = re.search(r"(?:v=|youtu\.be/)([^&\n?#]+)", url).group(1)
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([t['text'] for t in transcript])
        with open(f"/home/transcripts/{video_id}.txt", "w") as f:
            f.write(text)
        print(f"✅ {video_id}")
    except Exception as e:
        print(f"❌ {video_id}: {e}")
EOF
```

---

## Frame Extraction for Visual Analysis

```bash
# Extract 1 frame per 10 seconds for workflow analysis
VIDEO_PATH="/home/video_analysis/tutorial.mp4"
OUTPUT_DIR="/home/video_frames"
mkdir -p $OUTPUT_DIR

ffmpeg -i "$VIDEO_PATH" \
  -vf "fps=1/10,scale=1280:-1" \
  -q:v 2 \
  "$OUTPUT_DIR/frame_%04d.jpg" 2>/dev/null

echo "Frames extracted: $(ls $OUTPUT_DIR | wc -l)"

# Extract frames at higher rate for fast-moving UI demos
ffmpeg -i "$VIDEO_PATH" \
  -vf "fps=1/3,scale=1280:-1" \
  -q:v 2 \
  "$OUTPUT_DIR/fast_frame_%04d.jpg" 2>/dev/null
```

---

## Workflow Integration

```
YouTube URL
    │
    ├── sa-youtube-cli (this skill)
    │     ├── transcript extraction
    │     ├── chapter breakdown
    │     ├── metadata pull
    │     └── video download
    │
    ├── sa-workflow-copier
    │     ├── transcript → step decomposition
    │     ├── frames → UI pattern extraction
    │     └── output → executable build workflow
    │
    └── cinematic-website-builder
          └── build the site using extracted workflow
```

---

## Quick Reference

| Task | Command |
|---|---|
| Get transcript | `YouTubeTranscriptApi.get_transcript(video_id)` |
| Get metadata + chapters | `yt-dlp --skip-download -j URL` |
| Download video | `yt-dlp -f "best[height<=1080]" URL` |
| Search YouTube | `yt-dlp "ytsearch10:QUERY" --skip-download -j` |
| Extract frames | `ffmpeg -i video.mp4 -vf fps=1/10 frames/%04d.jpg` |
| Scrape channel | `yt-dlp --flat-playlist -j CHANNEL_URL` |

---

## Trigger This Skill When
- User pastes any YouTube URL
- User says: "get transcript", "search YouTube", "download this video", "pull captions"
- Need video content for sa-workflow-copier to analyze
- Searching for tutorial videos on a specific build technique
- Extracting chapter breakdowns from long tutorials
