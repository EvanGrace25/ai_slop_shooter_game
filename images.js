// Image Object Class
class ImageObject {
    constructor(x, y, category, type, imageData) {
        this.x = x;
        this.y = y;
        this.width = 200; // Doubled from 100
        this.height = 160; // Doubled from 80
        this.category = category;
        this.type = type; // 'real' or 'ai'
        this.imageData = imageData;
        this.hit = false;
        this.hitTime = 0;
        this.collected = false;
        this.glowTimer = 0; // frames of green glow feedback
        this.textDisplayTimer = 0; // frames for text display
        this.textOpacity = 0; // opacity for text fade
        
        // Load actual image if imageUrl is provided
        this.image = null;
        if (imageData.imageUrl) {
            this.image = new Image();
            this.image.src = imageData.imageUrl;
            this.image.onerror = () => {
                console.log(`Failed to load image: ${imageData.imageUrl}`);
                this.image = null;
            };
        }
    }
    
    update() {
        if (this.hit) {
            this.hitTime++;
            if (this.hitTime > 30) { // 0.5 seconds at 60fps
                this.hit = false;
                this.hitTime = 0;
            }
        }
        if (this.glowTimer > 0) {
            this.glowTimer--;
        }
        
        // Handle text display animation
        if (this.textDisplayTimer > 0) {
            this.textDisplayTimer--;
            
            // Fade in for first 20 frames, then fade out
            if (this.textDisplayTimer > 40) {
                this.textOpacity = Math.min(1, (60 - this.textDisplayTimer) / 20);
            } else {
                this.textOpacity = Math.max(0, this.textDisplayTimer / 40);
            }
        }
    }
    
    draw(ctx) {
        // Draw text overlay if image is collected and text is still displaying
        if (this.collected && this.textDisplayTimer > 0) {
            ctx.save();
            ctx.globalAlpha = this.textOpacity;
            
            // Large text styling
            ctx.font = 'bold 48px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Text color based on type
            ctx.fillStyle = this.type === 'real' ? '#2ecc71' : '#e74c3c';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            
            // Draw text with outline
            ctx.strokeText(this.type.toUpperCase(), this.x + this.width/2, this.y + this.height/2);
            ctx.fillText(this.type.toUpperCase(), this.x + this.width/2, this.y + this.height/2);
            
            ctx.restore();
            return;
        }
        
        if (this.collected) return;
        
        // Draw background only for glow effect
        if (this.glowTimer > 0) {
            // temporary green glow overlay
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw actual image if available
        if (this.image && this.image.complete) {
            // Calculate aspect ratio preserving dimensions
            const containerWidth = this.width - 4;
            const containerHeight = this.height - 4;
            const imageAspect = this.image.width / this.image.height;
            const containerAspect = containerWidth / containerHeight;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imageAspect > containerAspect) {
                // Image is wider than container - fit to width
                drawWidth = containerWidth;
                drawHeight = containerWidth / imageAspect;
                drawX = this.x + 2;
                drawY = this.y + 2 + (containerHeight - drawHeight) / 2;
            } else {
                // Image is taller than container - fit to height
                drawHeight = containerHeight;
                drawWidth = containerHeight * imageAspect;
                drawX = this.x + 2 + (containerWidth - drawWidth) / 2;
                drawY = this.y + 2;
            }
            
            // Debug logging for image dimensions
            if (Math.random() < 0.01) { // Only log occasionally to avoid spam
                console.log(`Image ${this.imageData.text || 'unknown'}: original=${this.image.width}x${this.image.height}, drawn=${Math.round(drawWidth)}x${Math.round(drawHeight)}, aspect=${imageAspect.toFixed(2)}`);
            }
            
            ctx.drawImage(this.image, drawX, drawY, drawWidth, drawHeight);
        } else {
            // Fallback to text if no image
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial'; // Increased from 10px
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Split text into lines if too long
            const text = this.imageData.text || 'Image';
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            words.forEach(word => {
                if (currentLine.length + word.length > 10) { // Increased from 8
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine += (currentLine ? ' ' : '') + word;
                }
            });
            if (currentLine) lines.push(currentLine);
            
            // Draw lines
            const lineHeight = 14; // Increased from 12
            const startY = this.y + this.height / 2 - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
                ctx.fillText(line, this.x + this.width / 2, startY + index * lineHeight);
            });
        }
        
        // Draw hit effect
        if (this.hit) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    checkCollision(target) {
        return this.x < target.x + target.width &&
               this.x + this.width > target.x &&
               this.y < target.y + target.height &&
               this.y + this.height > target.y;
    }
    
    onHit(gameState) {
        this.hit = true;
        this.hitTime = 0;
        
        if (this.type === 'ai') {
            // Shooting AI image = good
            gameState.addScore(10);
            gameState.addPoints(1);
            this.glowTimer = 30; // brief green feedback
            this.collected = true;
            this.textDisplayTimer = 60; // Show text for 1 second
            
            // Play correct sound
            soundManager.play('correct');
            
            return 'good';
        } else {
            // Shooting real image = bad (percentage-based damage)
            gameState.takeDamagePercentage();
            
            // Play incorrect sound
            soundManager.play('incorrect');
            
            return 'bad';
        }
    }
    
    onTouch(gameState) {
        if (this.collected) return 'none';
        
        if (this.type === 'real') {
            // Touching real image = good
            gameState.addScore(5);
            gameState.addPoints(1);
            this.glowTimer = 30; // brief green feedback
            this.collected = true;
            this.textDisplayTimer = 60; // Show text for 1 second
            
            // Play correct sound
            soundManager.play('correct');
            
            return 'good';
        } else {
            // Touching AI image = bad (percentage-based damage)
            gameState.takeDamagePercentage();
            this.collected = true; // Make AI image disappear after touching
            this.textDisplayTimer = 60; // Show text for 1 second
            
            // Play incorrect sound
            soundManager.play('incorrect');
            
            return 'bad';
        }
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some texture
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(this.x, this.y, this.width, 5);
        ctx.fillRect(this.x, this.y + this.height - 5, this.width, 5);
    }
}

// Category Tile Class (for menu)
class CategoryTile {
    constructor(x, y, category) {
        this.x = x;
        this.y = y;
        this.width = 120;
        this.height = 80;
        this.category = category;
        this.hit = false;
        this.hitTime = 0;
    }
    
    update() {
        if (this.hit) {
            this.hitTime++;
            if (this.hitTime > 30) {
                this.hit = false;
                this.hitTime = 0;
            }
        }
    }
    
    draw(ctx) {
        // Draw background based on state
        if (this.category.unlocked) {
            if (this.category.highScore > 0) {
                ctx.fillStyle = '#ffe66d'; // Completed
            } else {
                ctx.fillStyle = '#4ecdc4'; // Unlocked but not completed
            }
        } else {
            ctx.fillStyle = '#666'; // Locked
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border
        ctx.strokeStyle = this.category.unlocked ? '#2c3e50' : '#444';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw category name (more legible font and outline)
        ctx.fillStyle = '#fff';
        ctx.font = '600 20px Verdana, Geneva, Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.strokeText(this.category.name, this.x + this.width / 2, this.y + this.height / 2 - 12);
        ctx.fillText(this.category.name, this.x + this.width / 2, this.y + this.height / 2 - 12);
        
        // Draw high score if completed
        if (this.category.highScore > 0) {
            ctx.font = '600 14px Verdana, Geneva, Tahoma, sans-serif';
            ctx.strokeText(`High: ${this.category.highScore}`, this.x + this.width / 2, this.y + this.height / 2 + 10);
            ctx.fillText(`High: ${this.category.highScore}`, this.x + this.width / 2, this.y + this.height / 2 + 10);
        }
        
        // Draw lock icon if locked
        if (!this.category.unlocked) {
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('🔒', this.x + this.width / 2, this.y + this.height / 2 + 15);
        }
        
        // Draw hit effect
        if (this.hit) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    
    checkCollision(target) {
        return this.x < target.x + target.width &&
               this.x + this.width > target.x &&
               this.y < target.y + target.height &&
               this.y + this.height > target.y;
    }
    
    onHit(gameState) {
        if (this.category.unlocked) {
            this.hit = true;
            this.hitTime = 0;
            return this.category.id;
        }
        return null;
    }
}

// Particle Effect Class
class Particle {
    constructor(x, y, color = '#ffe66d') {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 10;
        this.velocityY = (Math.random() - 0.5) * 10;
        this.life = 30;
        this.maxLife = 30;
        this.color = color;
        this.size = Math.random() * 4 + 2;
        this.char = null; // optional character/emoji to render
        this.gravity = 0; // optional gravity to apply (e.g., drips)
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        if (this.char) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            // Bigger, clearer emoji text with outline for readability
            ctx.font = `${18 + this.size * 3}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Outline for contrast
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.strokeText(this.char, this.x, this.y);
            ctx.fillText(this.char, this.x, this.y);
            ctx.restore();
        } else {
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
    
    isDead() {
        return this.life <= 0;
    }
}
