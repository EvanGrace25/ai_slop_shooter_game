// Image Loader - Loads images from predefined lists (works with static files)
class ImageLoader {
    constructor() {
        this.loadedImages = {};
        this.imagePromises = {};
    }
    
    // Load all images for a category
    async loadCategoryImages(categoryId) {
        if (this.loadedImages[categoryId]) {
            return this.loadedImages[categoryId];
        }
        
        console.log(`Loading images for category: ${categoryId}`);
        
        try {
            const realImages = await this.loadPredefinedImages(categoryId, 'real');
            const aiImages = await this.loadPredefinedImages(categoryId, 'ai');
            
            console.log(`Real images found: ${realImages.length}, AI images found: ${aiImages.length}`);
            
            this.loadedImages[categoryId] = {
                real: realImages,
                ai: aiImages
            };
            
            return this.loadedImages[categoryId];
        } catch (error) {
            console.log(`Error loading images for category ${categoryId}:`, error);
            return this.getPlaceholderImages(categoryId);
        }
    }
    
    // Load predefined images for a category
    async loadPredefinedImages(categoryId, type) {
        const images = [];
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        // Get image names for this category
        const imageNames = this.getImageNamesForCategory(categoryId, type);
        
        for (const imageName of imageNames) {
            for (const ext of extensions) {
                const imagePath = `images/${categoryId}/${type}/${imageName}.${ext}`;
                try {
                    const image = await this.loadImage(imagePath);
                    images.push({ 
                        imageUrl: imagePath, 
                        text: `${type.toUpperCase()}: ${imageName}`, 
                        color: type === 'real' ? '#3498db' : '#e74c3c' 
                    });
                    console.log(`Loaded ${imagePath}`);
                    break; // Found the image, no need to try other extensions
                } catch (e) {
                    // Image doesn't exist with this extension, try next
                }
            }
        }
        
        return images;
    }
    
    // Get image names for each category
    getImageNamesForCategory(categoryId, type) {
        const imageNames = {
            dogs: {
                real: ['real_dog_shih-tzu', 'real_dogs_1', 'real_dogs_2', 'real_dogs_3', 'real_dogs_4', 'real_dogs_5', 'real_dogs_6', 'real_dogs_pexels-chevanon-1108099'],
                ai: ['ai-generated-7845349_640', 'ai-generated-8529788_1280', 'ai-generated-8711097_1280']
            },
            cats: {
                real: ['real_cat_2', 'real_cat_3', 'real_cat_4', 'real_cat_5', 'real_cat', 'real_cats_1', 'real_cats_2', 'real_cats_3'],
                ai: ['cat-farm-is-interested-basket-vegetables_23-2149211726', 'catsai-generated-8218284_1280', 'catsai-generated-8731511_1280', 'close-up-adorable-kitten-nature_23-2150782221', 'close-up-kitten-surrounded-by-flowers_23-2150782259', 'close-up-kitten-with-balls-yarn_23-2150782289(1)']
            },
            cars: {
                real: ['real_cars_1', 'real_cars_2', 'real_cars_3', 'real_cars_4', 'real_cars_5', 'real_cars_6'],
                ai: ['car_ai_generated', 'cars_2__ai_generated', 'cars_ai_generated', 'cars_ai-generated', 'QFP2Xft0_XcS6_1024']
            },
            food: {
                real: ['real_food_1', 'real_food_2', 'real_food_3'],
                ai: ['food_ai_1', 'food_ai_2', 'food_ai_3', 'food_ai_4', 'food_ai_5', 'food_ai_6']
            },
            nature: {
                real: ['real_nature_1', 'real_nature_2', 'real_nature_3', 'real_nature_4', 'real_nature_5', 'real_nature_6'],
                ai: ['nature_ai_1', 'nature_ai_2', 'nature_ai_3']
            },
            buildings: {
                real: ['real_buildings_1', 'real_buildings_2', 'real_buildings_3', 'real_buildings_4', 'real_buildings_5', 'real_buildings_6'],
                ai: ['88BZF6fs_d1el_raw', 'buildings__ai_generated', 'buildings2__ai_generated', 'buildings3__ai_generated']
            },
            people: {
                real: ['real_people_1', 'real_people_2', 'real_people_3'],
                ai: ['people_ai_1', 'people_ai_2', 'people_ai_3', 'people_ai_4', 'people_ai_5']
            },
            animals: {
                real: ['real_animals_1', 'real_animals_2', 'real_animals_3', 'real_animals_4', 'real_animals_5', 'real_animals_6'],
                ai: ['animals__ai_generated', 'animals_4_ai_generated', 'animals2_ai_generated', 'animals3_ai_generated']
            },
            art: {
                real: ['real_art_1', 'real_art_2', 'real_art_3', 'real_art_4', 'real_art_5', 'real_art_6'],
                ai: ['-LnEqzxS_Y62G_1024', '10SWNS2S_fLqU_1024', '19vFJVVW_v1nP_1024', 'csgbODsX_VvlD_1024', 'hiDyMmrQ_rz6J_1024', 'image_uid_IqJ67eu46oSnnYMjY7AN_MT2tveIR_1736489186366_1024', 'WnEa5L30_3UVb_1024']
            },
            music: {
                real: ['real_music_1', 'real_music_2', 'real_music_3', 'real_music_4', 'real_music_5', 'real_music_6'],
                ai: ['music_ai_1', 'music_ai_2', 'music_ai_3', 'music_ai_4', 'music_ai_5']
            },
            fashion: {
                real: ['real_fashion_1', 'real_fashion_2'],
                ai: ['fashion_ai_1', 'fashion_ai_2', 'fashion_ai_3', 'fashion_ai_4', 'fashion_ai_5', 'fashion_ai_6']
            },
            space: {
                real: ['real_space_1', 'real_space_2', 'real_space_3', 'real_space_4', 'real_space_5', 'real_space_6'],
                ai: ['space_ai_1', 'space_ai_2', 'space_ai_3', 'space_ai_4']
            },
            fantasy: {
                real: ['real_fantasy_1', 'real_fantasy_2', 'real_fantasy_3', 'real_fantasy_4'],
                ai: ['d-Qx9jZX__V8q_1024', 'TWYrfqXC_Ps5B_1024']
            },
            abstract: {
                real: ['real_abstract_1'],
                ai: ['8qKloHfB_vdfx_1024']
            },
            minimalist: {
                real: ['real_minimalist_1', 'real_minimalist_2', 'real_minimalist_3', 'real_minimalist_4'],
                ai: ['minimalist_ai_1', 'minimalist_ai_2', 'minimalist_ai_3', 'minimalist_ai_4']
            }
        };
        
        return imageNames[categoryId]?.[type] || [];
    }
    
    // Load a single image
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    // Get placeholder images if no real images are found
    getPlaceholderImages(categoryId) {
        console.log(`Using placeholder images for ${categoryId}`);
        return {
            real: [
                { text: `REAL: ${categoryId} placeholder 1`, color: '#3498db' },
                { text: `REAL: ${categoryId} placeholder 2`, color: '#3498db' },
                { text: `REAL: ${categoryId} placeholder 3`, color: '#3498db' }
            ],
            ai: [
                { text: `AI: ${categoryId} placeholder 1`, color: '#e74c3c' },
                { text: `AI: ${categoryId} placeholder 2`, color: '#e74c3c' },
                { text: `AI: ${categoryId} placeholder 3`, color: '#e74c3c' }
            ]
        };
    }
}

// Create global instance
const imageLoader = new ImageLoader();