#!/usr/bin/env python3
"""
AI Image Downloader - Manual Process
This script helps you download actual AI-generated images from free sources
"""

import os
import requests
from PIL import Image
import io
import time

def download_this_person_does_not_exist(count=10):
    """Download images from ThisPersonDoesNotExist.com"""
    print(f"📸 Downloading {count} AI-generated person images...")
    
    folder = "images/people/ai"
    os.makedirs(folder, exist_ok=True)
    
    for i in range(count):
        try:
            # ThisPersonDoesNotExist generates a new image each time
            url = "https://thispersondoesnotexist.com/image"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                img = Image.open(io.BytesIO(response.content))
                img = img.resize((800, 600), Image.Resampling.LANCZOS)
                
                filename = f"ai_people_{i+1}.jpg"
                filepath = os.path.join(folder, filename)
                img.save(filepath, 'JPEG', quality=85)
                
                print(f"✅ Saved: {filename}")
            else:
                print(f"❌ Failed to download image {i+1}")
                
        except Exception as e:
            print(f"❌ Error downloading image {i+1}: {e}")
        
        # Be respectful to the service
        time.sleep(2)

def download_from_huggingface_dataset():
    """Download from Hugging Face AI image datasets"""
    print("🤗 Downloading from Hugging Face AI datasets...")
    
    # Some known AI image datasets on Hugging Face
    datasets = [
        {
            'name': 'AI Generated Faces',
            'url': 'https://huggingface.co/datasets/ashraq/fake-faces',
            'categories': ['people']
        },
        {
            'name': 'AI Generated Animals', 
            'url': 'https://huggingface.co/datasets/ashraq/fake-animals',
            'categories': ['dogs', 'cats', 'animals']
        }
    ]
    
    print("📋 Available AI datasets:")
    for i, dataset in enumerate(datasets):
        print(f"{i+1}. {dataset['name']} - {dataset['url']}")
        print(f"   Categories: {', '.join(dataset['categories'])}")
    
    print("\n💡 To download from these datasets:")
    print("1. Visit the Hugging Face dataset page")
    print("2. Click 'Files and versions'")
    print("3. Download the images you want")
    print("4. Place them in the appropriate folders")

def create_ai_image_prompts():
    """Generate prompts for manual AI image creation"""
    categories = [
        'dogs', 'cats', 'cars', 'food', 'nature', 'buildings', 'people', 'animals',
        'art', 'music', 'fashion', 'space', 'fantasy', 'abstract', 'minimalist'
    ]
    
    print("🎨 AI Image Generation Prompts:")
    print("=" * 50)
    
    for category in categories:
        prompts = {
            'dogs': [
                "AI generated dog, photorealistic, high quality",
                "Synthetic dog image, artificial intelligence generated",
                "AI created dog portrait, digital art"
            ],
            'cats': [
                "AI generated cat, photorealistic, high quality", 
                "Synthetic cat image, artificial intelligence generated",
                "AI created cat portrait, digital art"
            ],
            'cars': [
                "AI generated car, photorealistic, high quality",
                "Synthetic car image, artificial intelligence generated", 
                "AI created vehicle, digital art"
            ],
            'food': [
                "AI generated food, photorealistic, high quality",
                "Synthetic food image, artificial intelligence generated",
                "AI created meal, digital art"
            ],
            'nature': [
                "AI generated landscape, photorealistic, high quality",
                "Synthetic nature image, artificial intelligence generated",
                "AI created scenery, digital art"
            ],
            'people': [
                "AI generated person, photorealistic, high quality",
                "Synthetic human image, artificial intelligence generated", 
                "AI created portrait, digital art"
            ],
            'art': [
                "AI generated artwork, digital art, high quality",
                "Synthetic art piece, artificial intelligence generated",
                "AI created painting, digital art"
            ],
            'music': [
                "AI generated musical instrument, photorealistic, high quality",
                "Synthetic music image, artificial intelligence generated",
                "AI created musical scene, digital art"
            ],
            'fashion': [
                "AI generated clothing, photorealistic, high quality",
                "Synthetic fashion image, artificial intelligence generated",
                "AI created outfit, digital art"
            ],
            'space': [
                "AI generated space scene, photorealistic, high quality",
                "Synthetic space image, artificial intelligence generated",
                "AI created cosmic art, digital art"
            ],
            'fantasy': [
                "AI generated fantasy creature, photorealistic, high quality",
                "Synthetic fantasy image, artificial intelligence generated",
                "AI created magical scene, digital art"
            ],
            'abstract': [
                "AI generated abstract art, high quality",
                "Synthetic abstract image, artificial intelligence generated",
                "AI created abstract composition, digital art"
            ],
            'minimalist': [
                "AI generated minimalist design, high quality",
                "Synthetic minimalist image, artificial intelligence generated",
                "AI created simple composition, digital art"
            ]
        }
        
        if category in prompts:
            print(f"\n{category.upper()}:")
            for prompt in prompts[category]:
                print(f"  • {prompt}")

def main():
    print("🤖 AI Image Downloader - Manual Process")
    print("=" * 50)
    print("This script helps you get actual AI-generated images")
    print()
    
    while True:
        print("\nOptions:")
        print("1. Download AI-generated people (ThisPersonDoesNotExist)")
        print("2. Show Hugging Face AI datasets")
        print("3. Generate AI image prompts for manual creation")
        print("4. Exit")
        
        choice = input("\nEnter choice (1-4): ").strip()
        
        if choice == '1':
            count = input("How many person images? (default 10): ").strip()
            count = int(count) if count.isdigit() else 10
            download_this_person_does_not_exist(count)
            
        elif choice == '2':
            download_from_huggingface_dataset()
            
        elif choice == '3':
            create_ai_image_prompts()
            
        elif choice == '4':
            print("👋 Goodbye!")
            break
            
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()
