#!/usr/bin/env python3
"""
Interactive Image Downloader with Approval Workflow
Downloads real and AI-generated images for the AI Slop Shooter game
"""

import os
import json
import requests
from PIL import Image
import io
import time
from tqdm import tqdm
import sys

# Game categories from config
CATEGORIES = [
    'dogs', 'cats', 'cars', 'food', 'nature', 'buildings', 'people', 'animals',
    'art', 'technology', 'sports', 'music', 'fashion', 'travel', 'space',
    'fantasy', 'abstract', 'vintage', 'minimalist', 'surreal'
]

class ImageDownloader:
    def __init__(self, base_path="images", target_count=6):
        self.base_path = base_path
        self.target_count = target_count
        self.progress_file = "download_progress.json"
        self.progress = self.load_progress()
        
    def load_progress(self):
        """Load existing progress from JSON file"""
        if os.path.exists(self.progress_file):
            with open(self.progress_file, 'r') as f:
                return json.load(f)
        return {"real": {}, "ai": {}}
    
    def save_progress(self):
        """Save current progress to JSON file"""
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def get_unsplash_images(self, category, count=10):
        """Fetch candidate images from Unsplash API"""
        try:
            # Using Unsplash's public API (no key required for basic access)
            url = f"https://unsplash.com/napi/search/photos"
            params = {
                'query': category,
                'per_page': count,
                'orientation': 'landscape'
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get('results', [])
            else:
                print(f"⚠️  Unsplash API returned status {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error fetching from Unsplash: {e}")
            return []
    
    def get_lexica_images(self, category, count=10):
        """Fetch AI-generated images from Lexica.art"""
        try:
            # Lexica.art public API
            url = "https://lexica.art/api/v1/search"
            params = {
                'q': category,
                'size': 'landscape',
                'per_page': count
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get('images', [])
            else:
                print(f"⚠️  Lexica API returned status {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error fetching from Lexica: {e}")
            return []
    
    def download_image(self, url, filename):
        """Download and save an image"""
        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                # Open with PIL to resize and optimize
                img = Image.open(io.BytesIO(response.content))
                
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize to consistent dimensions for game performance
                img = img.resize((800, 600), Image.Resampling.LANCZOS)
                
                # Save with optimization
                img.save(filename, 'JPEG', quality=85, optimize=True)
                return True
        except Exception as e:
            print(f"❌ Error downloading image: {e}")
        return False
    
    def show_image_preview(self, image_data, image_type, category, index, approved_count):
        """Display image info and get user approval"""
        try:
            # Get image URL and description
            if image_type == 'real':
                url = image_data.get('urls', {}).get('regular', '')
                description = image_data.get('description', 'No description')
                author = image_data.get('user', {}).get('name', 'Unknown')
            else:  # AI
                url = image_data.get('src', '')
                description = image_data.get('prompt', 'No description')[:100]
                author = 'AI Generated'
            
            if not url:
                return False
            
            print(f"\n{'='*60}")
            print(f"📸 {image_type.upper()} Image {index} for category: {category}")
            print(f"📝 Description: {description}")
            print(f"👤 Author: {author}")
            print(f"🔗 URL: {url}")
            print(f"{'='*60}")
            
            # Skip image preview to avoid opening files
            print("💡 Image preview skipped to avoid opening files")
            
            # Get user decision
            while True:
                # For testing, auto-approve first image, reject others
                choice = 'y' if approved_count == 0 else 'n'  # input("\nApprove this image? (Y)es / (N)o / (S)kip category / (Q)uit: ").lower().strip()
                print(f"\nAuto-choice: {choice}")
                if choice in ['y', 'yes']:
                    return True
                elif choice in ['n', 'no']:
                    return False
                elif choice in ['s', 'skip']:
                    return 'skip'
                elif choice in ['q', 'quit']:
                    return 'quit'
                else:
                    print("Please enter Y, N, S, or Q")
        
        except Exception as e:
            print(f"❌ Error showing preview: {e}")
            return False
    
    def download_category_images(self, category, image_type):
        """Download images for a specific category and type"""
        print(f"\n🎯 Starting {image_type} images for category: {category}")
        
        # Check if we already have enough images
        category_path = os.path.join(self.base_path, category, image_type)
        if not os.path.exists(category_path):
            os.makedirs(category_path, exist_ok=True)
        
        existing_count = len([f for f in os.listdir(category_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
        needed = max(0, self.target_count - existing_count)
        
        if needed == 0:
            print(f"✅ Category {category} ({image_type}) already has {existing_count} images")
            return True
        
        print(f"📊 Need {needed} more images (have {existing_count}/{self.target_count})")
        
        # Fetch candidate images
        if image_type == 'real':
            candidates = self.get_unsplash_images(category, needed * 2)  # Get extra for filtering
        else:
            candidates = self.get_lexica_images(category, needed * 2)
        
        if not candidates:
            print(f"❌ No {image_type} images found for {category}")
            return False
        
        approved_count = 0
        for i, candidate in enumerate(candidates):
            if approved_count >= needed:
                break
            
            # Show preview and get approval
            result = self.show_image_preview(candidate, image_type, category, i + 1, approved_count)
            
            if result == 'quit':
                print("👋 Quitting download process")
                return False
            elif result == 'skip':
                print(f"⏭️  Skipping {category} category")
                return True
            elif result:
                # Download and save approved image
                filename = f"{image_type}_{category}_{approved_count + 1}.jpg"
                filepath = os.path.join(category_path, filename)
                
                if image_type == 'real':
                    url = candidate.get('urls', {}).get('regular', '')
                else:
                    url = candidate.get('src', '')
                
                if self.download_image(url, filepath):
                    approved_count += 1
                    print(f"✅ Saved: {filename}")
                else:
                    print(f"❌ Failed to download image")
            
            # Small delay to be respectful to APIs
            time.sleep(0.5)
        
        print(f"🎉 Completed {category} ({image_type}): {approved_count} images downloaded")
        return True
    
    def run(self):
        """Main download process"""
        print("🚀 AI Slop Shooter Image Downloader")
        print(f"📁 Target: {self.target_count} images per category/type")
        print(f"📂 Base path: {self.base_path}")
        
        # Ask user what to download
        print("\nWhat would you like to download?")
        print("1. Real images only")
        print("2. AI images only") 
        print("3. Both real and AI images")
        print("4. Specific categories only")
        
        # For testing, default to option 1 (real images only)
        choice = "1"  # input("Enter choice (1-4): ").strip()
        
        if choice == '4':
            # Let user select specific categories
            print(f"\nAvailable categories: {', '.join(CATEGORIES)}")
            # For testing, use first 3 categories only
            categories = ['dogs', 'cats', 'cars']  # input("Enter categories (comma-separated): ").strip().split(',')
            # categories = [cat.strip() for cat in selected if cat.strip() in CATEGORIES]
        else:
            categories = CATEGORIES
        
        if not categories:
            print("❌ No valid categories selected")
            return
        
        # Download based on choice
        for category in tqdm(categories, desc="Processing categories"):
            if choice in ['1', '3']:
                self.download_category_images(category, 'real')
            if choice in ['2', '3']:
                self.download_category_images(category, 'ai')
        
        print("\n🎉 Download process completed!")
        self.save_progress()

if __name__ == "__main__":
    # Check if required packages are installed
    try:
        import PIL
        import requests
        from tqdm import tqdm
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        print("💡 Run: pip install -r requirements.txt")
        sys.exit(1)
    
    # Create downloader and run
    downloader = ImageDownloader()
    downloader.run()
