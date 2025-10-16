# Image Downloader for AI Slop Shooter Game

This script helps you download and organize real and AI-generated images for all game categories with an approval workflow.

## Setup

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Run the downloader:
```bash
python download_images.py
```

## Features

- **Interactive Approval**: Preview each image before downloading
- **Progress Tracking**: Resume interrupted downloads
- **Auto-Organization**: Saves images to correct `images/{category}/{real|ai}/` folders
- **Image Optimization**: Resizes images to 800x600 for game performance
- **Multiple Sources**: 
  - Real images from Unsplash API
  - AI images from Lexica.art API

## Usage

1. **Choose what to download:**
   - Real images only
   - AI images only  
   - Both real and AI images
   - Specific categories only

2. **For each image:**
   - Preview opens automatically
   - Choose: (Y)es to approve, (N)o to reject, (S)kip category, (Q)uit

3. **Images are automatically:**
   - Downloaded and resized to 800x600
   - Saved with clean filenames like `real_dogs_1.jpg`
   - Organized in the correct game folders

## Target: 6 images per category/type (240 total images)

## Notes

- No API keys required for basic usage
- Progress is saved in `download_progress.json`
- Images are optimized for web game performance
- Respectful delays between API calls
