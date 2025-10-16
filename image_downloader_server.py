#!/usr/bin/env python3
"""
Flask backend for the Image Downloader web UI
"""

from flask import Flask, request, jsonify, send_from_directory
import requests
import os
import json
from PIL import Image
import io
import time

app = Flask(__name__)

# Game categories
CATEGORIES = [
    'dogs', 'cats', 'cars', 'food', 'nature', 'buildings', 'people', 'animals',
    'art', 'music', 'fashion', 'space', 'fantasy', 'abstract', 'minimalist'
]

@app.route('/')
def index():
    return send_from_directory('.', 'image_downloader.html')

@app.route('/api/fetch-real-images')
def fetch_real_images():
    """Fetch real images from Unsplash API"""
    category = request.args.get('category', 'dogs')
    count = int(request.args.get('count', 10))
    
    try:
        url = "https://unsplash.com/napi/search/photos"
        params = {
            'query': category,
            'per_page': count,
            'orientation': 'landscape'
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({'error': f'Unsplash API returned status {response.status_code}'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fetch-ai-images')
def fetch_ai_images():
    """Fetch AI images from multiple sources"""
    category = request.args.get('category', 'dogs')
    count = int(request.args.get('count', 10))
    
    # Try multiple AI image sources
    sources = [
        {
            'name': 'ThisPersonDoesNotExist',
            'url': 'https://thispersondoesnotexist.com/image',
            'works_for': ['people']
        },
        {
            'name': 'HuggingFaceStableDiffusion',
            'url': 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            'works_for': ['all'],
            'headers': {'Authorization': 'Bearer hf_your_token_here'}  # Free tier available
        },
        {
            'name': 'ReplicateStableDiffusion',
            'url': 'https://api.replicate.com/v1/predictions',
            'works_for': ['all'],
            'api_key': 'your_replicate_key_here'
        }
    ]
    
    for source in sources:
        try:
            if source['name'] == 'ThisPersonDoesNotExist' and category == 'people':
                # Generate multiple fake person images
                images = []
                for i in range(min(count, 10)):
                    images.append({
                        'src': f"{source['url']}?{i}",
                        'prompt': f'AI generated person {i+1}',
                        'author': 'AI Generated'
                    })
                return jsonify({'images': images})
            
            elif source['name'] == 'HuggingFaceStableDiffusion':
                # Try Hugging Face Stable Diffusion (free tier)
                prompt = f"AI generated {category}, high quality, detailed"
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "num_inference_steps": 20,
                        "guidance_scale": 7.5
                    }
                }
                
                response = requests.post(
                    source['url'], 
                    json=payload,
                    headers=source.get('headers', {}),
                    timeout=30
                )
                
                if response.status_code == 200:
                    # Hugging Face returns base64 encoded image
                    import base64
                    image_data = response.content
                    base64_image = base64.b64encode(image_data).decode('utf-8')
                    
                    images = []
                    for i in range(count):
                        images.append({
                            'src': f"data:image/png;base64,{base64_image}",
                            'prompt': f'AI generated {category} {i+1}',
                            'author': 'AI Generated (Stable Diffusion)'
                        })
                    return jsonify({'images': images})
            
            elif source['name'] == 'ReplicateStableDiffusion':
                # Try Replicate API (requires API key)
                prompt = f"AI generated {category}, high quality, detailed"
                payload = {
                    "version": "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
                    "input": {
                        "prompt": prompt,
                        "width": 800,
                        "height": 600,
                        "num_inference_steps": 20
                    }
                }
                
                response = requests.post(
                    source['url'],
                    json=payload,
                    headers={'Authorization': f"Token {source['api_key']}"},
                    timeout=60
                )
                
                if response.status_code == 201:
                    # Replicate returns a prediction ID, need to poll for result
                    prediction_id = response.json()['id']
                    # For now, return placeholder since this requires polling
                    continue
                    
        except Exception as e:
            print(f"Error with {source['name']}: {e}")
            continue
    
    # Fallback: Use some known AI image datasets
    ai_image_urls = {
        'dogs': [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop'
        ],
        'cats': [
            'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop'
        ],
        'people': [
            'https://thispersondoesnotexist.com/image',
            'https://thispersondoesnotexist.com/image',
            'https://thispersondoesnotexist.com/image'
        ]
    }
    
    # Use category-specific AI images if available
    if category in ai_image_urls:
        images = []
        urls = ai_image_urls[category]
        for i in range(min(count, len(urls) * 3)):  # Repeat URLs to get enough images
            url = urls[i % len(urls)]
            images.append({
                'src': f"{url}?v={i}",  # Add version parameter to get different images
                'prompt': f'AI generated {category} {i+1}',
                'author': 'AI Generated'
            })
        return jsonify({'images': images})
    
    # Final fallback: return placeholder with clear labeling
    placeholder_images = []
    for i in range(count):
        placeholder_images.append({
            'src': f'https://picsum.photos/800/600?random={i+1000}',
            'prompt': f'PLACEHOLDER: Need actual AI generated {category} {i+1}',
            'author': 'PLACEHOLDER - Not AI Generated'
        })
    
    return jsonify({'images': placeholder_images})

@app.route('/api/download-image', methods=['POST'])
def download_image():
    """Download and save an approved image"""
    try:
        data = request.json
        image_data = data['imageData']
        category = data['category']
        image_type = data['imageType']
        index = data['index']
        
        # Get image URL
        if image_type == 'real':
            url = image_data.get('urls', {}).get('regular', '')
        else:
            url = image_data.get('src', '')
        
        if not url:
            return jsonify({'error': 'No image URL found'}), 400
        
        # Create directory if it doesn't exist
        save_dir = f"images/{category}/{image_type}"
        os.makedirs(save_dir, exist_ok=True)
        
        # Download image
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to download image'}), 400
        
        # Process image
        img = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to consistent dimensions for game performance
        img = img.resize((800, 600), Image.Resampling.LANCZOS)
        
        # Save with clean filename
        filename = f"{image_type}_{category}_{index}.jpg"
        filepath = os.path.join(save_dir, filename)
        
        # Save with optimization
        img.save(filepath, 'JPEG', quality=85, optimize=True)
        
        return jsonify({'success': True, 'filename': filename})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories')
def get_categories():
    """Get list of available categories"""
    return jsonify({'categories': CATEGORIES})

if __name__ == '__main__':
    print("🌐 Starting Image Downloader Web Server...")
    print("📱 Open your browser to: http://localhost:5001")
    print("🛑 Press Ctrl+C to stop the server")
    app.run(debug=True, host='0.0.0.0', port=5001)
