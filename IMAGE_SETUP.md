# AI Slop Shooter Game - Image Setup Guide

## 📁 Folder Structure

The game automatically loads images from the following folder structure:

```
images/
├── dogs/
│   ├── real/
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   ├── 3.jpg
│   │   └── ...
│   └── ai/
│       ├── 1.jpg
│       ├── 2.jpg
│       ├── 3.jpg
│       └── ...
├── cats/
│   ├── real/
│   └── ai/
├── cars/
│   ├── real/
│   └── ai/
└── ... (other categories)
```

## 🎯 How to Add Your Images

### Step 1: Create Category Folders
For each category you want to add images to, create a folder structure like:
- `images/dogs/real/` - for real dog images
- `images/dogs/ai/` - for fake/AI-generated dog images

### Step 2: Add Your Images
1. **Name your images numerically**: `1.jpg`, `2.jpg`, `3.jpg`, etc.
2. **Supported formats**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
3. **Place real images** in the `real/` folder
4. **Place fake/AI images** in the `ai/` folder

### Step 3: The Game Will Automatically Load Them
- The game will automatically detect and load up to 20 images per folder
- If no images are found, it will use placeholder text
- Images are displayed in the game with proper collision detection

## 🐕 Example: Adding Dog Images

1. **Create folders**:
   ```
   images/dogs/real/
   images/dogs/ai/
   ```

2. **Add your images**:
   ```
   images/dogs/real/1.jpg    (real golden retriever)
   images/dogs/real/2.jpg    (real labrador)
   images/dogs/real/3.jpg    (real beagle)
   
   images/dogs/ai/1.jpg      (fake dog with 6 legs)
   images/dogs/ai/2.jpg      (fake floating dog)
   images/dogs/ai/3.jpg      (fake dog with human hands)
   ```

3. **Play the game** - the dogs category will now show your actual images!

## 🎮 Game Mechanics

- **Real images**: Touch them with your character to get points
- **AI/Fake images**: Shoot them to get points
- **Don't mix them up**: Shooting real images or touching fake images will damage you!

## 📝 Notes

- Images are automatically resized to fit the game (100x80 pixels)
- The game supports up to 20 images per category per type
- If you add more than 20 images, only the first 20 will be used
- Image loading is cached, so they won't reload every time you play a level
