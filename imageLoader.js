// Image Loader - Automatically loads images from folder structure
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
        
        console.log(`Attempting to load images for category: ${categoryId}`);
        
        try {
            const realImages = await this.loadImagesFromFolder(`./images/${categoryId}/real/`);
            const aiImages = await this.loadImagesFromFolder(`./images/${categoryId}/ai/`);
            
            console.log(`Real images found: ${realImages.length}, AI images found: ${aiImages.length}`);
            
            this.loadedImages[categoryId] = {
                real: realImages,
                ai: aiImages
            };
            
            console.log(`Loaded ${realImages.length} real and ${aiImages.length} AI images for ${categoryId}`);
            return this.loadedImages[categoryId];
        } catch (error) {
            console.log(`Error loading images for category ${categoryId}:`, error);
            console.log(`No images found for category ${categoryId}, using placeholders`);
            return this.getPlaceholderImages(categoryId);
        }
    }
    
    // Load images from a specific folder
    async loadImagesFromFolder(folderPath) {
        const images = [];
        console.log(`Loading images from folder: ${folderPath}`);
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        // STRATEGY 1: Parse directory listing (works with Python http.server)
        try {
            // Normalize to absolute URL and ensure trailing slash
            let folderUrl = folderPath;
            if (folderUrl.startsWith('./')) folderUrl = folderUrl.slice(1);
            if (!folderUrl.startsWith('/')) folderUrl = '/' + folderUrl;
            if (!folderUrl.endsWith('/')) folderUrl += '/';

            const res = await fetch(folderUrl, { credentials: 'same-origin' });
            if (res.ok) {
                const html = await res.text();
                console.log(`[imageLoader] Listing fetched for ${folderUrl} (length=${html.length})`);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const anchors = Array.from(doc.querySelectorAll('a'));
                let hrefs = anchors.map(a => a.getAttribute('href')).filter(Boolean);
                // Fallback: regex scrape if DOM parsing yields nothing
                if (hrefs.length === 0) {
                    hrefs = Array.from(html.matchAll(/href="([^"]+)"/gi)).map(m => m[1]);
                }
                console.log(`[imageLoader] HREFs found:`, hrefs);
                const fileLinks = hrefs.filter(href => {
                    const lower = href.toLowerCase();
                    if (lower.endsWith('/')) return false; // skip directories
                    return extensions.some(ext => lower.endsWith(`.${ext}`));
                });
                console.log(`[imageLoader] Image HREFs after filter:`, fileLinks);
                for (const href of fileLinks) {
                    const imagePath = new URL(href, window.location.origin + folderUrl).href;
                    console.log(`[imageLoader] Trying ${imagePath}`);
                    try {
                        const image = await this.loadImage(imagePath);
                        images.push({ imageUrl: imagePath, text: decodeURIComponent(href).replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''), color: '#3498db' });
                        console.log(`[imageLoader] Loaded ${imagePath}`);
                    } catch (_) { /* ignore individual failures */ }
                }
            }
        } catch (e) {
            console.log('Directory listing fetch failed; falling back to heuristics.', e);
        }

        // STRATEGY 2: Fallback heuristics if nothing found
        if (images.length === 0) {
            const nameCandidates = [];
            for (let i = 1; i <= 30; i++) {
                for (const ext of extensions) nameCandidates.push(`${i}.${ext}`);
            }
            const commonNames = ['cat','kitten','tabby','siamese','maine-coon','fluffy','cute','photo','img','image','pic'];
            for (const base of commonNames) {
                for (const ext of extensions) nameCandidates.push(`${base}.${ext}`);
            }
            for (const filename of nameCandidates) {
                const imagePath = `${folderPath}${filename}`;
                try {
                    const image = await this.loadImage(imagePath);
                    images.push({ imageUrl: imagePath, text: filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''), color: '#3498db' });
                } catch (_) { /* ignore */ }
            }
        }

        console.log(`Total images loaded from ${folderPath}: ${images.length}`);
        return images;
    }
    
    // Load a single image
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
        });
    }
    
    // Get placeholder images if no real images found
    getPlaceholderImages(categoryId) {
        const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
        
        return {
            real: [
                { text: `REAL: ${categoryName} 1`, color: '#3498db' },
                { text: `REAL: ${categoryName} 2`, color: '#3498db' },
                { text: `REAL: ${categoryName} 3`, color: '#3498db' },
                { text: `REAL: ${categoryName} 4`, color: '#3498db' },
                { text: `REAL: ${categoryName} 5`, color: '#3498db' }
            ],
            ai: [
                { text: `AI: ${categoryName} with extra parts`, color: '#e74c3c' },
                { text: `AI: Floating ${categoryName}`, color: '#e74c3c' },
                { text: `AI: ${categoryName} in impossible pose`, color: '#e74c3c' },
                { text: `AI: Glowing ${categoryName}`, color: '#e74c3c' },
                { text: `AI: ${categoryName} with wrong colors`, color: '#e74c3c' }
            ]
        };
    }
}

// Global image loader instance
const imageLoader = new ImageLoader();
