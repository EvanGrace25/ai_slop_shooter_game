// Player Character Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.facingRight = true;
        this.lastShot = 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Aiming system
        this.aimAngle = 0; // Angle in degrees (0 = horizontal, -90 = up, 90 = down)
        this.aimDirection = 1; // 1 for right, -1 for left
        this.gunRotation = 0; // Horizontal rotation angle (-90 to 90 degrees)
        
        // Animation system
        this.animationFrame = 0;
        this.walkCycle = 0;
        this.jumpFrame = 0;
        this.isWalking = false;
        this.isJumping = false;
        this.lastGroundY = y;
        
        // Load pumpkin image
        this.pumpkinImage = new Image();
        this.pumpkinImage.src = 'pumpkin_character.jpg';
    }
    
    update(keys, platforms, gameState) {
        const stats = gameState.getPlayerStats();
        
        // Handle horizontal movement
        if (keys['ArrowLeft']) {
            this.velocityX = -stats.speed;
            this.facingRight = false;
            this.isWalking = true;
        } else if (keys['ArrowRight']) {
            this.velocityX = stats.speed;
            this.facingRight = true;
            this.isWalking = true;
        } else {
            this.velocityX *= CONFIG.FRICTION;
            this.isWalking = false;
        }
        
        // Handle gun rotation with WASD (character-relative system)
        if (keys['w'] || keys['W']) {
            this.aimAngle = Math.max(-90, this.aimAngle - 3); // Aim up
        }
        if (keys['s'] || keys['S']) {
            this.aimAngle = Math.min(90, this.aimAngle + 3); // Aim down
        }
        if (keys['a'] || keys['A']) {
            // Rotate gun backward relative to facing direction
            if (this.facingRight) {
                this.gunRotation = Math.max(-90, this.gunRotation - 3);
            } else {
                this.gunRotation = Math.min(90, this.gunRotation + 3);
            }
        }
        if (keys['d'] || keys['D']) {
            // Rotate gun forward relative to facing direction
            if (this.facingRight) {
                this.gunRotation = Math.min(90, this.gunRotation + 3);
            } else {
                this.gunRotation = Math.max(-90, this.gunRotation - 3);
            }
        }
        
        // Handle jumping
        if (keys['ArrowUp'] && this.onGround) {
            this.velocityY = stats.jumpHeight - stats.reachability; // Apply reachability bonus
            this.onGround = false;
            this.hasDoubleJumped = false;
            this.isJumping = true;
            this.jumpFrame = 0;
        }
        
        // Handle double jump
        if (keys['ArrowUp'] && 
            stats.doubleJump && !this.onGround && !this.hasDoubleJumped) {
            this.velocityY = (stats.jumpHeight - stats.reachability) * 0.8; // Apply reachability bonus to double jump too
            this.hasDoubleJumped = true;
            this.jumpFrame = 0;
        }
        
        // Apply gravity
        this.velocityY += CONFIG.GRAVITY;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Platform collision
        this.handlePlatformCollision(platforms);
        
        // Boundary collision
        this.handleBoundaryCollision();
        
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTime--;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update animation frames
        this.animationFrame++;
        
        // Walking animation
        if (this.isWalking) {
            this.walkCycle = (this.walkCycle + 0.2) % (Math.PI * 2);
        } else {
            this.walkCycle = 0;
        }
        
        // Jumping animation
        if (this.isJumping) {
            this.jumpFrame++;
            if (this.onGround) {
                this.isJumping = false;
                this.jumpFrame = 0;
            }
        }
        
        // Track ground position for landing animation
        if (this.onGround) {
            this.lastGroundY = this.y;
        }
    }
    
    handlePlatformCollision(platforms) {
        this.onGround = false;
        
        platforms.forEach(platform => {
            // Check if player is colliding with platform
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Determine collision side
                const overlapLeft = (this.x + this.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - this.x;
                const overlapTop = (this.y + this.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - this.y;
                
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                
                if (minOverlap === overlapTop && this.velocityY > 0) {
                    // Landing on top
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                    this.hasDoubleJumped = false;
                } else if (minOverlap === overlapBottom && this.velocityY < 0) {
                    // Hitting bottom
                    this.y = platform.y + platform.height;
                    this.velocityY = 0;
                } else if (minOverlap === overlapLeft) {
                    // Hitting left side
                    this.x = platform.x - this.width;
                    this.velocityX = 0;
                } else if (minOverlap === overlapRight) {
                    // Hitting right side
                    this.x = platform.x + platform.width;
                    this.velocityX = 0;
                }
            }
        });
    }
    
    handleBoundaryCollision() {
        // Left boundary
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        
        // Right boundary - removed to allow movement throughout the level
        // Player can now move through the entire 3000px level width
        
        // Bottom boundary (falling off screen)
        if (this.y > CONFIG.CANVAS_HEIGHT) {
            this.y = CONFIG.CANVAS_HEIGHT - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
    }
    
    shoot(gameState) {
        const weaponStats = gameState.getWeaponStats();
        const currentTime = Date.now();
        
        if (currentTime - this.lastShot >= weaponStats.fireRate) {
            this.lastShot = currentTime;
            
            const bullets = [];
            const bulletX = this.x + this.width / 2;
            const bulletY = this.y + this.height / 2;
            
            // Calculate final bullet direction based on both vertical and horizontal rotation
            const finalAngle = this.aimAngle + this.gunRotation;
            // Bullet direction based on character facing
            const bulletDirection = this.facingRight ? 1 : -1;
            
            // Create bullets based on weapon type
            if (weaponStats.bullets === 1) {
                bullets.push(new Bullet(bulletX, bulletY, bulletDirection, weaponStats, finalAngle));
            } else {
                // Spread shot
                const spreadAngle = weaponStats.spread;
                const angleStep = spreadAngle / (weaponStats.bullets - 1);
                const startAngle = finalAngle - spreadAngle / 2;
                
                for (let i = 0; i < weaponStats.bullets; i++) {
                    const angle = startAngle + (angleStep * i);
                    bullets.push(new Bullet(bulletX, bulletY, bulletDirection, weaponStats, angle));
                }
            }
            
            return bullets;
        }
        
        return [];
    }
    
    takeDamage(amount, gameState) {
        if (!this.invulnerable) {
            gameState.takeDamage(amount);
            this.invulnerable = true;
            this.invulnerabilityTime = 60; // 1 second at 60fps
        }
    }
    
    draw(ctx) {
        // Draw player with invulnerability flash
        if (!this.invulnerable || Math.floor(this.invulnerabilityTime / 5) % 2 === 0) {
            // Calculate center coordinates BEFORE any transforms
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            
            ctx.save();
            
            // Calculate animation offsets
            const walkOffset = Math.sin(this.walkCycle) * 2; // Slight bounce while walking
            const jumpOffset = this.isJumping ? Math.min(this.jumpFrame * 0.5, 8) : 0;
            const idleBounce = Math.sin(this.animationFrame * 0.1) * 0.5; // Subtle breathing
            
            // Flip horizontally if facing left
            if (!this.facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-2 * centerX, 0);
            }
            
            // Draw pumpkin body with animation - improved pixel art style
            const pumpkinY = this.y + walkOffset + jumpOffset + idleBounce;
            
            // Draw pumpkin body (more detailed orange)
            ctx.fillStyle = '#ff8c00';
            ctx.fillRect(this.x + 5, pumpkinY + 15, 30, 35);
            
            // Draw pumpkin ridges (vertical lines) - more detailed
            ctx.strokeStyle = '#ff7f00';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + 8 + i * 6, pumpkinY + 15);
                ctx.lineTo(this.x + 8 + i * 6, pumpkinY + 50);
                ctx.stroke();
            }
            
            // Draw pumpkin stem (more detailed)
            ctx.fillStyle = '#228b22';
            ctx.fillRect(this.x + 17, pumpkinY + 10, 6, 8);
            // Add stem highlight
            ctx.fillStyle = '#32cd32';
            ctx.fillRect(this.x + 18, pumpkinY + 10, 2, 6);
            
            // Draw face - more detailed and determined
            ctx.fillStyle = '#000';
            // Eyes (more determined/angry)
            ctx.fillRect(this.x + 12, pumpkinY + 25, 3, 3);
            ctx.fillRect(this.x + 25, pumpkinY + 25, 3, 3);
            // Eyebrows (more angled/determined)
            ctx.fillRect(this.x + 10, pumpkinY + 22, 5, 2);
            ctx.fillRect(this.x + 25, pumpkinY + 22, 5, 2);
            // Mouth (more determined expression)
            ctx.fillRect(this.x + 18, pumpkinY + 35, 8, 2);
            ctx.fillRect(this.x + 18, pumpkinY + 37, 3, 2);
            ctx.fillRect(this.x + 23, pumpkinY + 37, 3, 2);
            
            // Draw legs with walking animation
            const legOffset = Math.sin(this.walkCycle) * 3;
            const leftLegOffset = this.isWalking ? legOffset : 0;
            const rightLegOffset = this.isWalking ? -legOffset : 0;
            
            // Left leg
            ctx.fillStyle = '#ff8c00';
            ctx.fillRect(this.x + 12, pumpkinY + 50 + leftLegOffset, 4, 8);
            // Right leg
            ctx.fillRect(this.x + 24, pumpkinY + 50 + rightLegOffset, 4, 8);
            
            ctx.restore();
            
            // Draw arms with aiming (ORIGINAL LOGIC) - OUTSIDE TRANSFORM
            ctx.fillStyle = '#ff8c00';
            const finalAngle = this.aimAngle + this.gunRotation;
            const armRadians = (finalAngle * Math.PI) / 180;
            const armDirection = this.facingRight ? 1 : -1;
            const armEndX = centerX + Math.cos(armRadians) * 15 * armDirection;
            const armEndY = centerY + Math.sin(armRadians) * 15;
            
            // Draw arm
            ctx.strokeStyle = '#ff8c00';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(armEndX, armEndY);
            ctx.stroke();
            
            // Draw gun at the end of the arm, rotated to match arm direction
            ctx.save();
            ctx.translate(armEndX, armEndY);
            ctx.rotate(armRadians);
            
            // Draw gun body
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(-3, -2, 12, 4);
            ctx.fillStyle = '#ff8c00';
            ctx.fillRect(9, -2, 6, 4);
            
            // Draw gun barrel
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(15, -1, 8, 2);
            
            ctx.restore();
        }
        
        // Draw aiming line (ORIGINAL LOGIC)
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const aimLength = 30;
        
        ctx.strokeStyle = '#ffe66d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Calculate final aiming direction combining vertical and horizontal rotation
        const finalAngle = this.aimAngle + this.gunRotation;
        const radians = (finalAngle * Math.PI) / 180;
        // Direction based on character facing
        const direction = this.facingRight ? 1 : -1;
        
        const endX = centerX + Math.cos(radians) * aimLength * direction;
        const endY = centerY + Math.sin(radians) * aimLength;
        
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw gun rotation indicator (arm) - shows both horizontal and vertical movement
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Use final angle (combining both horizontal and vertical rotation) for arm position
        const armRadians = (finalAngle * Math.PI) / 180;
        const armDirection = this.facingRight ? 1 : -1;
        const armEndX = centerX + Math.cos(armRadians) * 20 * armDirection;
        const armEndY = centerY + Math.sin(armRadians) * 20;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(armEndX, armEndY);
        ctx.stroke();
        
        // Draw double jump indicator
        if (this.hasDoubleJumped) {
            ctx.fillStyle = '#ffe66d';
            ctx.fillRect(this.x - 2, this.y - 5, this.width + 4, 3);
        }
    }
}

// Bullet Class
class Bullet {
    constructor(x, y, direction, weaponStats, angle = 0) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 6;
        this.speed = weaponStats.bulletSpeed;
        this.damage = weaponStats.damage;
        this.direction = direction; // 1 for right, -1 for left
        this.angle = angle;
        this.bounces = 0;
        this.maxBounces = weaponStats.bullets === 1 && weaponStats.spread === 0 ? 3 : 0; // Only bouncing bullets bounce
        this.active = true;
        
        // Calculate velocity based on angle and direction
        const radians = (angle * Math.PI) / 180;
        this.velocityX = Math.cos(radians) * this.speed * direction;
        this.velocityY = Math.sin(radians) * this.speed;
    }
    
    update(platforms) {
        if (!this.active) return;
        
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Check platform collision for bouncing
        if (this.maxBounces > 0) {
            platforms.forEach(platform => {
                if (this.x < platform.x + platform.width &&
                    this.x + this.width > platform.x &&
                    this.y < platform.y + platform.height &&
                    this.y + this.height > platform.y &&
                    this.bounces < this.maxBounces) {
                    
                    // Simple bounce logic
                    this.velocityX *= -1;
                    this.bounces++;
                }
            });
        }
        
        // Remove bullet if it goes off screen (allow bullets to travel further in extended levels)
        if (this.x < -50 || this.x > 3500 || 
            this.y < -50 || this.y > CONFIG.CANVAS_HEIGHT + 50) {
            this.active = false;
        }
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        ctx.fillStyle = '#ffe66d';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add glow effect
        ctx.shadowColor = '#ffe66d';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    checkCollision(target) {
        return this.x < target.x + target.width &&
               this.x + this.width > target.x &&
               this.y < target.y + target.height &&
               this.y + this.height > target.y;
    }
}
