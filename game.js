// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.lastTime = 0;
        
        // Game objects
        this.player = null;
        this.platforms = [];
        this.imageObjects = [];
        this.bullets = [];
        this.particles = [];
        this.categoryTiles = [];
        
        // Game state
        this.cameraX = 0;
        this.levelWidth = 0;
        this.currentLevel = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up canvas for high-DPI displays
        this.setupCanvas();
        
        // Initialize game state
        gameState = new GameState();
        weaponSystem = new WeaponSystem();
        upgradeSystem = new UpgradeSystem();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupCanvas() {
        // Get device pixel ratio for crisp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set the actual canvas size in memory (scaled up for high-DPI)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale the canvas back down using CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Scale the drawing context so everything draws at the correct size
        this.ctx.scale(dpr, dpr);
        
        // Enable high-quality rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        console.log(`Canvas setup: display=${rect.width}x${rect.height}, actual=${this.canvas.width}x${this.canvas.height}, dpr=${dpr}`);
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const wasPressed = this.keys[e.key];
            this.keys[e.key] = true;
            
            // Prevent default behavior for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape'].includes(e.key)) {
                e.preventDefault();
            }
            
            // Handle special keys (only on first press)
            if (e.key === 'Escape' && !wasPressed) {
                this.togglePause();
            }
            
            if (e.key === 'Enter' && gameState.currentState === 'mainMenu' && !wasPressed) {
                this.startCategorySelection();
            }
            
            // Handle shooting (only on first press)
            if ((e.key === ' ' || e.key === 'Enter') && gameState.currentState === 'playing' && !wasPressed) {
                this.handleShooting();
            }
            
            if ((e.key === ' ' || e.key === 'Enter') && gameState.currentState === 'categorySelect' && !wasPressed) {
                this.handleShooting();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mouse events for shooting
        this.canvas.addEventListener('click', (e) => {
            if (gameState.currentState === 'playing') {
                this.handleShooting();
            }
        });
        
        // UI button events
        document.getElementById('startGame').addEventListener('click', () => {
            this.startCategorySelection();
        });
        
        document.getElementById('upgradeShop').addEventListener('click', () => {
            gameState.setState('upgradeShop');
        });
        
        document.getElementById('backFromShop').addEventListener('click', () => {
            gameState.setState('mainMenu');
        });
        
        document.getElementById('resumeGame').addEventListener('click', () => {
            gameState.setState('playing');
        });
        
        document.getElementById('quitToMenu').addEventListener('click', () => {
            gameState.setState('mainMenu');
        });
        
        document.getElementById('nextLevel').addEventListener('click', () => {
            gameState.setState('mainMenu');
        });
        
        document.getElementById('backToMenu').addEventListener('click', () => {
            gameState.setState('mainMenu');
        });

        // Failed screen buttons
        const retryBtn = document.getElementById('retryLevel');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                if (gameState.currentCategory) {
                    this.startLevel(gameState.currentCategory);
                } else {
                    gameState.setState('mainMenu');
                }
            });
        }
        const failMenuBtn = document.getElementById('failToMenu');
        if (failMenuBtn) {
            failMenuBtn.addEventListener('click', () => gameState.setState('mainMenu'));
        }
        
        // Upgrade buttons
        Object.keys(CONFIG.UPGRADES).forEach(upgradeKey => {
            const button = document.getElementById(`${upgradeKey}Upgrade`);
            if (button) {
                button.addEventListener('click', () => {
                    if (gameState.buyUpgrade(upgradeKey)) {
                        // Upgrade successful
                        console.log(`Upgraded ${upgradeKey}`);
                    }
                });
            }
        });
        
        // Weapon purchase buttons
        for (let i = 1; i < 5; i++) {
            const button = document.getElementById(`buyWeapon${i}`);
            if (button) {
                button.addEventListener('click', () => {
                    if (gameState.buyWeapon(i)) {
                        console.log(`Purchased weapon ${i}`);
                    }
                });
            }
        }
        
        // Category unlock button
        document.getElementById('unlockCategory').addEventListener('click', () => {
            const lockedCategories = CONFIG.CATEGORIES.filter(cat => !cat.unlocked);
            if (lockedCategories.length > 0) {
                const nextCategory = lockedCategories[0];
                if (gameState.unlockCategory(nextCategory.id)) {
                    console.log(`Unlocked category ${nextCategory.id}`);
                }
            }
        });
    }
    
    startCategorySelection() {
        gameState.setState('categorySelect');
        this.setupCategorySelection();
    }
    
    setupCategorySelection() {
        // Create platforms for category selection
        this.platforms = [];
        this.levelWidth = 2500; // Menu world width
        
        // Ground platform
        this.platforms.push(new Platform(0, CONFIG.CANVAS_HEIGHT - 50, this.levelWidth, 50));
        
        // Create platforms throughout the menu world - higher
        const platformPositions = [
            {x: 200, y: CONFIG.CANVAS_HEIGHT - 140, width: 120},
            {x: 400, y: CONFIG.CANVAS_HEIGHT - 200, width: 100},
            {x: 600, y: CONFIG.CANVAS_HEIGHT - 170, width: 110},
            {x: 800, y: CONFIG.CANVAS_HEIGHT - 220, width: 90},
            {x: 1000, y: CONFIG.CANVAS_HEIGHT - 180, width: 120},
            {x: 1200, y: CONFIG.CANVAS_HEIGHT - 240, width: 100},
            {x: 1400, y: CONFIG.CANVAS_HEIGHT - 160, width: 110},
            {x: 1600, y: CONFIG.CANVAS_HEIGHT - 200, width: 90},
            {x: 1800, y: CONFIG.CANVAS_HEIGHT - 220, width: 120},
            {x: 2000, y: CONFIG.CANVAS_HEIGHT - 180, width: 100},
            {x: 2200, y: CONFIG.CANVAS_HEIGHT - 210, width: 110}
        ];
        
        platformPositions.forEach(pos => {
            this.platforms.push(new Platform(pos.x, pos.y, pos.width, 20));
        });
        
        // Create category tiles placed on platforms throughout the world
        this.categoryTiles = [];
        const categories = CONFIG.CATEGORIES;
        
        // Add STORE block near the top
        this.storeBlock = new CategoryTile(100, 100, { 
            id: 'store', 
            name: 'STORE', 
            unlocked: true, 
            highScore: 0 
        });
        
        categories.forEach((category, index) => {
            // Choose a platform for this category (distribute across platforms)
            const platformIndex = Math.min(index, this.platforms.length - 1);
            const platform = this.platforms[platformIndex];
            
            // Place tile on the platform
            const tileSize = 80;
            const x = platform.x + Math.random() * (platform.width - tileSize);
            const y = platform.y - tileSize - 10; // Above the platform
            
            this.categoryTiles.push(new CategoryTile(x, y, category));
        });
        
        // Create player
        this.player = new Player(100, CONFIG.CANVAS_HEIGHT - 100);
        
        // Clear other game objects
        this.imageObjects = [];
        this.bullets = [];
        this.particles = [];
        this.cameraX = 0;
    }
    
    async startLevel(categoryId) {
        gameState.startLevel(categoryId);
        await this.setupLevel(categoryId);
    }
    
    async setupLevel(categoryId) {
        const category = CONFIG.CATEGORIES.find(cat => cat.id === categoryId);
        if (!category) return;
        
        this.currentLevel = categoryId;
        
        // Create platforms
        this.platforms = [];
        this.levelWidth = 4000; // Increased level width to accommodate new spacing
        
        // Ground platform
        this.platforms.push(new Platform(0, CONFIG.CANVAS_HEIGHT - 50, this.levelWidth, 50));
        
        // Create a clear linear path with guaranteed progression - higher platforms
        const pathPlatforms = [
            {x: 250, y: CONFIG.CANVAS_HEIGHT - 120, width: 120}, // First platform
            {x: 500, y: CONFIG.CANVAS_HEIGHT - 140, width: 100}, // Slight step up
            {x: 750, y: CONFIG.CANVAS_HEIGHT - 120, width: 120}, // Back down
            {x: 1000, y: CONFIG.CANVAS_HEIGHT - 170, width: 100}, // Higher step
            {x: 1250, y: CONFIG.CANVAS_HEIGHT - 140, width: 120}, // Down a bit
            {x: 1500, y: CONFIG.CANVAS_HEIGHT - 120, width: 100}, // Back to low
            {x: 1750, y: CONFIG.CANVAS_HEIGHT - 200, width: 100}, // Higher
            {x: 2000, y: CONFIG.CANVAS_HEIGHT - 140, width: 120}, // Down
            {x: 2250, y: CONFIG.CANVAS_HEIGHT - 120, width: 100}, // Low
            {x: 2500, y: CONFIG.CANVAS_HEIGHT - 220, width: 100}, // High
            {x: 2750, y: CONFIG.CANVAS_HEIGHT - 140, width: 120}, // Down
            {x: 3000, y: CONFIG.CANVAS_HEIGHT - 120, width: 100}, // Low
            {x: 3250, y: CONFIG.CANVAS_HEIGHT - 170, width: 120}, // Medium
            {x: 3500, y: CONFIG.CANVAS_HEIGHT - 120, width: 100}  // Final platform
        ];
        
        // Add the main path platforms
        pathPlatforms.forEach(platform => {
            this.platforms.push(new Platform(platform.x, platform.y, platform.width, 20));
        });
        
        // Add some optional side platforms for exploration (but don't block the path) - higher
        const sidePlatforms = [
            {x: 400, y: CONFIG.CANVAS_HEIGHT - 220, width: 80}, // High optional platform
            {x: 900, y: CONFIG.CANVAS_HEIGHT - 270, width: 80}, // Very high optional
            {x: 1400, y: CONFIG.CANVAS_HEIGHT - 240, width: 80}, // High optional
            {x: 1900, y: CONFIG.CANVAS_HEIGHT - 300, width: 80}, // Very high optional
            {x: 2400, y: CONFIG.CANVAS_HEIGHT - 270, width: 80}, // High optional
            {x: 2900, y: CONFIG.CANVAS_HEIGHT - 240, width: 80}  // High optional
        ];
        
        // Add side platforms (these are optional and don't block progression)
        sidePlatforms.forEach(platform => {
            this.platforms.push(new Platform(platform.x, platform.y, platform.width, 20));
        });
        
        // Create image objects
        this.imageObjects = [];
        this.hasTargets = false; // track if any targets were placed
        
        // Load images dynamically from folders
        try {
            const imageData = await imageLoader.loadCategoryImages(categoryId);
            
            if (imageData && (imageData.real.length > 0 || imageData.ai.length > 0)) {
                // Place real images with overlap prevention
                imageData.real.forEach((img, index) => {
                    let attempts = 0;
                    let placed = false;
                    
                    while (!placed && attempts < 20) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        
                        // Check for overlap with existing images
                        let hasOverlap = false;
                        for (let existingImg of this.imageObjects) {
                            if (Math.abs(x - existingImg.x) < 240 && Math.abs(y - existingImg.y) < 200) {
                                hasOverlap = true;
                                break;
                            }
                        }
                        
                        if (!hasOverlap) {
                            this.imageObjects.push(new ImageObject(x, y, categoryId, 'real', img));
                            this.hasTargets = true;
                            placed = true;
                        }
                        attempts++;
                    }
                    
                    // If couldn't place without overlap, place anyway
                    if (!placed) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        this.imageObjects.push(new ImageObject(x, y, categoryId, 'real', img));
                        this.hasTargets = true;
                    }
                });
                
                // Place AI images with overlap prevention
                imageData.ai.forEach((img, index) => {
                    let attempts = 0;
                    let placed = false;
                    
                    while (!placed && attempts < 20) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        
                        // Check for overlap with existing images
                        let hasOverlap = false;
                        for (let existingImg of this.imageObjects) {
                            if (Math.abs(x - existingImg.x) < 240 && Math.abs(y - existingImg.y) < 200) {
                                hasOverlap = true;
                                break;
                            }
                        }
                        
                        if (!hasOverlap) {
                            this.imageObjects.push(new ImageObject(x, y, categoryId, 'ai', img));
                            this.hasTargets = true;
                            placed = true;
                        }
                        attempts++;
                    }
                    
                    // If couldn't place without overlap, place anyway
                    if (!placed) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        this.imageObjects.push(new ImageObject(x, y, categoryId, 'ai', img));
                        this.hasTargets = true;
                    }
                });
            } else {
                console.log('No images loaded, using fallback placeholders');
                // Fallback to config images if no images loaded
                const fallbackData = CONFIG.IMAGE_DATA[categoryId];
                if (fallbackData) {
                    // Place real images with overlap prevention
                    fallbackData.real.forEach((img, index) => {
                        let attempts = 0;
                        let placed = false;
                        
                        while (!placed && attempts < 20) {
                            const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                            const x = platform.x + Math.random() * (platform.width - 200);
                            const y = platform.y - 160;
                            
                            // Check for overlap with existing images
                            let hasOverlap = false;
                            for (let existingImg of this.imageObjects) {
                                if (Math.abs(x - existingImg.x) < 240 && Math.abs(y - existingImg.y) < 200) {
                                    hasOverlap = true;
                                    break;
                                }
                            }
                            
                            if (!hasOverlap) {
                                this.imageObjects.push(new ImageObject(x, y, categoryId, 'real', img));
                                this.hasTargets = true;
                                placed = true;
                            }
                            attempts++;
                        }
                        
                        // If couldn't place without overlap, place anyway
                        if (!placed) {
                            const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                            const x = platform.x + Math.random() * (platform.width - 200);
                            const y = platform.y - 160;
                            this.imageObjects.push(new ImageObject(x, y, categoryId, 'real', img));
                            this.hasTargets = true;
                        }
                    });
                    
                    // Place AI images with overlap prevention
                    fallbackData.ai.forEach((img, index) => {
                        let attempts = 0;
                        let placed = false;
                        
                        while (!placed && attempts < 20) {
                            const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                            const x = platform.x + Math.random() * (platform.width - 200);
                            const y = platform.y - 160;
                            
                            // Check for overlap with existing images
                            let hasOverlap = false;
                            for (let existingImg of this.imageObjects) {
                                if (Math.abs(x - existingImg.x) < 240 && Math.abs(y - existingImg.y) < 200) {
                                    hasOverlap = true;
                                    break;
                                }
                            }
                            
                            if (!hasOverlap) {
                                this.imageObjects.push(new ImageObject(x, y, categoryId, 'ai', img));
                                this.hasTargets = true;
                                placed = true;
                            }
                            attempts++;
                        }
                        
                        // If couldn't place without overlap, place anyway
                        if (!placed) {
                            const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                            const x = platform.x + Math.random() * (platform.width - 200);
                            const y = platform.y - 160;
                            this.imageObjects.push(new ImageObject(x, y, categoryId, 'ai', img));
                            this.hasTargets = true;
                        }
                    });
                }
            }
        } catch (error) {
            console.log('Error loading images, using placeholders:', error);
            // Fallback to config images if folder loading fails
            const imageData = CONFIG.IMAGE_DATA[categoryId];
            if (imageData) {
                // Place real images with overlap prevention
                imageData.real.forEach((img, index) => {
                    let attempts = 0;
                    let placed = false;
                    
                    while (!placed && attempts < 20) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        
                        // Check for overlap with existing images
                        let hasOverlap = false;
                        for (let existingImg of this.imageObjects) {
                            if (Math.abs(x - existingImg.x) < 240 && Math.abs(y - existingImg.y) < 200) {
                                hasOverlap = true;
                                break;
                            }
                        }
                        
                        if (!hasOverlap) {
                            this.imageObjects.push(new ImageObject(x, y, categoryId, 'real', img));
                            this.hasTargets = true;
                            placed = true;
                        }
                        attempts++;
                    }
                    
                    // If couldn't place without overlap, place anyway
                    if (!placed) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        this.imageObjects.push(new ImageObject(x, y, categoryId, 'real', img));
                        this.hasTargets = true;
                    }
                });
                
                // Place AI images with overlap prevention
                imageData.ai.forEach((img, index) => {
                    let attempts = 0;
                    let placed = false;
                    
                    while (!placed && attempts < 20) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        
                        // Check for overlap with existing images
                        let hasOverlap = false;
                        for (let existingImg of this.imageObjects) {
                            if (Math.abs(x - existingImg.x) < 240 && Math.abs(y - existingImg.y) < 200) {
                                hasOverlap = true;
                                break;
                            }
                        }
                        
                        if (!hasOverlap) {
                            this.imageObjects.push(new ImageObject(x, y, categoryId, 'ai', img));
                            this.hasTargets = true;
                            placed = true;
                        }
                        attempts++;
                    }
                    
                    // If couldn't place without overlap, place anyway
                    if (!placed) {
                        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                        const x = platform.x + Math.random() * (platform.width - 200);
                        const y = platform.y - 160;
                        this.imageObjects.push(new ImageObject(x, y, categoryId, 'ai', img));
                        this.hasTargets = true;
                    }
                });
            }
        }
        
        
        // Ensure we have at least some images to prevent immediate level completion
        if (this.imageObjects.length === 0) {
            console.log('No images placed, adding emergency placeholder');
            // Add emergency placeholder images
            this.imageObjects.push(new ImageObject(300, CONFIG.CANVAS_HEIGHT - 150, categoryId, 'real', { text: 'REAL: Emergency', color: '#3498db' }));
            this.imageObjects.push(new ImageObject(500, CONFIG.CANVAS_HEIGHT - 150, categoryId, 'ai', { text: 'AI: Emergency', color: '#e74c3c' }));
            this.hasTargets = true;
        }
        
        // Set dynamic health based on number of images
        gameState.setLevelHealth(this.imageObjects.length);
        
        // Create player
        this.player = new Player(100, CONFIG.CANVAS_HEIGHT - 100);
        
        // Add level end zone
        this.levelEndX = this.levelWidth - 200; // Level ends 200px before the edge
        
        // Clear other objects
        this.bullets = [];
        this.particles = [];
        this.categoryTiles = [];
        this.cameraX = 0;
    }
    
    handleShooting() {
        if (this.player && (gameState.currentState === 'playing' || gameState.currentState === 'categorySelect')) {
            const newBullets = this.player.shoot(gameState);
            this.bullets.push(...newBullets);
        }
    }
    
    togglePause() {
        if (gameState.currentState === 'playing') {
            gameState.setState('paused');
        } else if (gameState.currentState === 'paused') {
            gameState.setState('playing');
        }
    }
    
    update(deltaTime) {
        if (gameState.currentState === 'categorySelect') {
            this.updateCategorySelection();
        } else if (gameState.currentState === 'playing') {
            this.updateGameplay();
        }
    }
    
    updateCategorySelection() {
        if (this.player) {
            this.player.update(this.keys, this.platforms, gameState);
            
            // Update camera to follow player
            this.cameraX = this.player.x - CONFIG.CANVAS_WIDTH / 2;
            this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - CONFIG.CANVAS_WIDTH));
            
            // Update bullets
            this.bullets.forEach(bullet => bullet.update(this.platforms));
            this.bullets = this.bullets.filter(bullet => bullet.active);
            
            // Check bullet collisions with category tiles
            this.bullets.forEach(bullet => {
                this.categoryTiles.forEach(tile => {
                    if (bullet.checkCollision(tile)) {
                        const categoryId = tile.onHit(gameState);
                        if (categoryId) {
                            this.startLevel(categoryId);
                        }
                        bullet.active = false;
                    }
                });
                
                // Check bullet collision with store block
                if (this.storeBlock && bullet.checkCollision(this.storeBlock)) {
                    gameState.setState('upgradeShop');
                    bullet.active = false;
                }
            });
            
            // Update category tiles
            this.categoryTiles.forEach(tile => tile.update());
        }
    }
    
    updateGameplay() {
        if (this.player) {
            this.player.update(this.keys, this.platforms, gameState);
            
            // Update camera to follow player
            this.cameraX = this.player.x - CONFIG.CANVAS_WIDTH / 2;
            this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelWidth - CONFIG.CANVAS_WIDTH));
            
            // Update bullets
            this.bullets.forEach(bullet => bullet.update(this.platforms));
            this.bullets = this.bullets.filter(bullet => bullet.active);
            
            // Check bullet collisions with image objects
            this.bullets.forEach(bullet => {
                this.imageObjects.forEach(imgObj => {
                    if (!imgObj.collected && bullet.checkCollision(imgObj)) {
                        const result = imgObj.onHit(gameState);
                        if (result === 'good') {
                            const cx = imgObj.x + imgObj.width/2;
                            const cy = imgObj.y + imgObj.height/2;
                            this.createParticles(cx, cy, '#2ecc71');
                            this.createCoinBurst(cx, cy);
                        } else if (result === 'bad') {
                            const cx = imgObj.x + imgObj.width/2;
                            const cy = imgObj.y + imgObj.height/2;
                            this.createParticles(cx, cy, '#e74c3c');
                            this.createSadDrip(cx, cy);
                        }
                        bullet.active = false;
                    }
                });
            });
            
            // Check player collisions with image objects
            this.imageObjects.forEach(imgObj => {
                if (imgObj.checkCollision(this.player)) {
                    const result = imgObj.onTouch(gameState);
                    if (result === 'good') {
                        const cx = imgObj.x + imgObj.width/2;
                        const cy = imgObj.y + imgObj.height/2;
                        this.createParticles(cx, cy, '#2ecc71');
                        this.createCoinBurst(cx, cy);
                    } else if (result === 'bad') {
                        const cx = imgObj.x + imgObj.width/2;
                        const cy = imgObj.y + imgObj.height/2;
                        this.createParticles(cx, cy, '#e74c3c');
                        this.createSadDrip(cx, cy);
                    }
                }
            });
            
            // Update image objects
            this.imageObjects.forEach(imgObj => imgObj.update());
            
            // Check level completion (only if we actually have targets)
            const remainingObjects = this.imageObjects.filter(obj => !obj.collected);
            const reachedEnd = this.player.x >= this.levelEndX;
            
            // Debug: Log level completion check
            console.log(`Level completion check: hasTargets=${this.hasTargets}, remainingObjects=${remainingObjects.length}, reachedEnd=${reachedEnd}, playerX=${this.player.x}, levelEndX=${this.levelEndX}`);
            
            if ((this.hasTargets && remainingObjects.length === 0) || reachedEnd) {
                console.log('Level completing!');
                gameState.completeLevel();
            }
            
            // Update particles
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.isDead());
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    // Coin burst feedback when scoring (more, farther, brighter)
    createCoinBurst(x, y) {
        const count = 20;
        for (let i = 0; i < count; i++) {
            const p = new Particle(x, y, '#fff37a');
            p.velocityY = - (Math.random() * 12 + 8); // strong upward
            p.velocityX = (Math.random() - 0.5) * 12; // wider spread
            p.size = Math.random() * 6 + 4; // bigger
            p.maxLife = p.life = 55 + Math.floor(Math.random() * 15); // last longer
            this.particles.push(p);
        }
        // extra sparkle
        for (let i = 0; i < 8; i++) {
            const s = new Particle(x, y, '#a3ff9b');
            s.velocityY = - (Math.random() * 10 + 6);
            s.velocityX = (Math.random() - 0.5) * 10;
            s.size = Math.random() * 3 + 2;
            s.maxLife = s.life = 45;
            this.particles.push(s);
        }
    }

    // Sad drip effect when losing points/health (red frowny faces drip down) - more, farther, brighter
    createSadDrip(x, y) {
        const count = 14;
        for (let i = 0; i < count; i++) {
            const p = new Particle(x + (Math.random() - 0.5) * 60, y, '#ff4d4d');
            p.char = '☹️';
            p.velocityX = (Math.random() - 0.5) * 2.5;
            p.velocityY = Math.random() * 4 + 2; // start downward
            p.gravity = 0.35; // stronger gravity
            p.size = Math.random() * 4 + 3;
            p.maxLife = p.life = 60 + Math.floor(Math.random() * 20);
            this.particles.push(p);
        }
        // deeper red droplets
        for (let i = 0; i < 10; i++) {
            const d = new Particle(x + (Math.random() - 0.5) * 50, y, '#ff2b2b');
            d.velocityX = (Math.random() - 0.5) * 2;
            d.velocityY = Math.random() * 5 + 3;
            d.gravity = 0.4;
            d.size = Math.random() * 3 + 2;
            d.maxLife = d.life = 50;
            this.particles.push(d);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        if (gameState.currentState === 'categorySelect') {
            this.drawCategorySelection();
        } else if (gameState.currentState === 'playing') {
            this.drawGameplay();
        }
    }
    
    drawCategorySelection() {
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Draw sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#E0F6FF'); // Light blue
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.levelWidth, CONFIG.CANVAS_HEIGHT);
        
        // Draw clouds (multiple layers for depth)
        this.drawClouds();
        
        // Draw moving text behind clouds
        this.drawMovingText();
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Draw category tiles
        this.categoryTiles.forEach(tile => tile.draw(this.ctx));
        
        // Draw store block
        if (this.storeBlock) {
            this.storeBlock.draw(this.ctx);
        }
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Restore context
        this.ctx.restore();
        
        // Draw instructions
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 400, 120);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('AI Slop Shooter', 20, 30);
        this.ctx.fillText('Shoot categories to select them', 20, 50);
        this.ctx.fillText('Arrow keys: Move, Up: Jump', 20, 70);
        this.ctx.fillText('W/S: Aim up/down, A/D: Rotate gun', 20, 90);
        this.ctx.fillText('Space: Shoot, ESC: Pause', 20, 110);
    }
    
    drawClouds() {
        // Create clouds with different sizes and positions
        const cloudPositions = [
            {x: 100, y: 80, size: 60},
            {x: 400, y: 120, size: 80},
            {x: 700, y: 60, size: 70},
            {x: 1000, y: 100, size: 90},
            {x: 1300, y: 70, size: 65},
            {x: 1600, y: 110, size: 75},
            {x: 1900, y: 85, size: 85},
            {x: 2200, y: 95, size: 70}
        ];
        
        cloudPositions.forEach(cloud => {
            this.drawSingleCloud(cloud.x, cloud.y, cloud.size);
        });
    }
    
    drawSingleCloud(x, y, size) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        
        // Draw cloud shape with multiple circles
        this.ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.2, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y - size * 0.15, size * 0.35, 0, Math.PI * 2);
        
        this.ctx.fill();
    }
    
    drawMovingText() {
        // Calculate text position to be centered on screen with parallax effect
        const screenCenterX = CONFIG.CANVAS_WIDTH / 2;
        const parallaxOffset = this.cameraX * 0.6; // Increased from 0.3 to 0.6 for more movement
        const textX = screenCenterX + parallaxOffset;
        const textY = 250; // Lowered from 200 to 250
        
        // Draw text with shadow effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SHOOT THE LEVEL YOU WANT TO PLAY', textX + 2, textY + 2);
        
        // Draw main text
        this.ctx.fillStyle = '#FFD700'; // Gold color
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SHOOT THE LEVEL YOU WANT TO PLAY', textX, textY);
        
        // Add some sparkle effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('SHOOT THE LEVEL YOU WANT TO PLAY', textX - 1, textY - 1);
    }
    
    drawCategoryText() {
        // Get current category name
        const currentCategory = CONFIG.CATEGORIES.find(cat => cat.id === gameState.currentCategory);
        const categoryName = currentCategory ? currentCategory.name.toUpperCase() : 'UNKNOWN';
        
        // Calculate text position to be centered on screen with parallax effect
        const screenCenterX = CONFIG.CANVAS_WIDTH / 2;
        const parallaxOffset = this.cameraX * 0.6; // Same parallax as menu text
        const textX = screenCenterX + parallaxOffset;
        const textY = 250; // Same position as menu text
        
        // Draw text with shadow effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(categoryName, textX + 2, textY + 2);
        
        // Draw main text
        this.ctx.fillStyle = '#FFD700'; // Gold color
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(categoryName, textX, textY);
        
        // Add some sparkle effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText(categoryName, textX - 1, textY - 1);
    }
    
    drawGameplay() {
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);
        
        // Draw sky background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(1, '#E0F6FF'); // Light blue
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.levelWidth, CONFIG.CANVAS_HEIGHT);
        
        // Draw clouds (multiple layers for depth)
        this.drawClouds();
        
        // Draw moving category text behind clouds
        this.drawCategoryText();
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Draw level end zone
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        this.ctx.fillRect(this.levelEndX, 0, 200, CONFIG.CANVAS_HEIGHT);
        
        // Draw level end indicator
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL END', this.levelEndX + 100, CONFIG.CANVAS_HEIGHT / 2);
        
        // Draw image objects
        this.imageObjects.forEach(imgObj => imgObj.draw(this.ctx));
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Restore context
        this.ctx.restore();
        
        // Draw HUD (not affected by camera)
        this.drawHUD();
    }
    
    drawHUD() {
        // HUD is handled by CSS and gameState.updateHUD()
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
