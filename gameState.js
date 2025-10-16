// Game State Management
class GameState {
    constructor() {
        this.currentState = 'mainMenu'; // mainMenu, categorySelect, playing, paused, levelComplete, upgradeShop
        this.currentCategory = null;
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.points = 0;
        this.currentWeapon = 0;
        this.unlockedWeapons = [0]; // Start with pistol
        this.unlockedCategories = CONFIG.CATEGORIES.filter(cat => cat.unlocked).map(cat => cat.id);
        
        // Player upgrades
        this.upgrades = {
            speed: 0,
            jumpHeight: 0,
            doubleJump: 0,
            reachability: 0,
            fireRate: 0,
            damage: 0,
            bulletSpeed: 0,
            maxHealth: 0,
            shield: 0
        };
        
        // Load saved data
        this.loadGame();
    }
    
    // Save game data to localStorage
    saveGame() {
        const saveData = {
            score: this.score,
            points: this.points,
            unlockedWeapons: this.unlockedWeapons,
            unlockedCategories: this.unlockedCategories,
            upgrades: this.upgrades,
            categories: CONFIG.CATEGORIES.map(cat => ({
                id: cat.id,
                unlocked: cat.unlocked,
                highScore: cat.highScore
            }))
        };
        localStorage.setItem('aiSlopShooter', JSON.stringify(saveData));
    }
    
    // Load game data from localStorage
    loadGame() {
        const saveData = localStorage.getItem('aiSlopShooter');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.score = data.score || 0;
                this.points = data.points || 0;
                this.unlockedWeapons = data.unlockedWeapons || [0];
                this.unlockedCategories = data.unlockedCategories || CONFIG.CATEGORIES.filter(cat => cat.unlocked).map(cat => cat.id);
                this.upgrades = data.upgrades || this.upgrades;
                
                // Update categories with saved data
                if (data.categories) {
                    data.categories.forEach(savedCat => {
                        const configCat = CONFIG.CATEGORIES.find(cat => cat.id === savedCat.id);
                        if (configCat) {
                            configCat.unlocked = savedCat.unlocked;
                            configCat.highScore = savedCat.highScore;
                        }
                    });
                }
            } catch (e) {
                console.log('Error loading save data:', e);
            }
        }
    }
    
    // Change game state
    setState(newState) {
        this.currentState = newState;
        this.updateUI();
    }
    
    // Update UI based on current state
    updateUI() {
        // Hide all overlays
        document.querySelectorAll('.ui-overlay').forEach(overlay => {
            overlay.classList.add('hidden');
        });
        
        // Show appropriate overlay
        switch (this.currentState) {
            case 'mainMenu':
                document.getElementById('mainMenu').classList.remove('hidden');
                break;
            case 'categorySelect':
                // Category selection is handled by the game canvas
                break;
            case 'playing':
                document.getElementById('gameHUD').classList.remove('hidden');
                this.updateHUD();
                break;
            case 'paused':
                document.getElementById('pauseMenu').classList.remove('hidden');
                break;
            case 'levelComplete':
                document.getElementById('levelComplete').classList.remove('hidden');
                this.updateLevelComplete();
                break;
            case 'levelFailed':
                document.getElementById('levelFailed').classList.remove('hidden');
                this.updateLevelFailed();
                break;
            case 'upgradeShop':
                document.getElementById('upgradeShopUI').classList.remove('hidden');
                this.updateUpgradeShop();
                break;
        }
    }
    
    // Update HUD elements
    updateHUD() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('healthFill').style.width = `${(this.health / this.maxHealth) * 100}%`;
        document.getElementById('weaponDisplay').textContent = CONFIG.WEAPONS[this.currentWeapon].name;
    }
    
    // Update level complete screen
    updateLevelComplete() {
        const message = CONFIG.COMPLETION_MESSAGES[Math.floor(Math.random() * CONFIG.COMPLETION_MESSAGES.length)];
        document.getElementById('completionMessage').textContent = message;
        
        const breakdown = document.getElementById('scoreBreakdown');
        let breakdownHTML = `
            <p>Final Score: ${this.score}</p>
            <p>Points Earned This Level: ${this.pointsEarnedThisLevel || 0}</p>
        `;
        
        // Add random level unlock message if applicable
        if (this.randomLevelUnlocked) {
            breakdownHTML += `
                <p style="color: #FFD700; font-weight: bold; font-size: 18px;">
                    🎉 NEW LEVEL UNLOCKED! 🎉
                </p>
                <p style="color: #32CD32; font-weight: bold;">
                    "${this.randomLevelUnlocked.name}" is now available!
                </p>
            `;
        }
        
        breakdownHTML += `<p>Visit the shop to unlock new weapons and upgrades!</p>`;
        
        breakdown.innerHTML = breakdownHTML;
    }

    // Update level failed screen
    updateLevelFailed() {
        const sadSayings = [
            "AI detected your defeat pattern. It’s learning from your tears...",
            "You were out-algorithmed. Even the AI is frowning.",
            "The slop wins today. Tomorrow it’s personal.",
            "Model says: 99% chance you try again.",
            "AIs don’t cry. We did it for them. ☹️"
        ];
        const text = sadSayings[Math.floor(Math.random() * sadSayings.length)];
        const el = document.getElementById('failMessage');
        if (el) el.textContent = text;
    }
    
    // Update upgrade shop
    updateUpgradeShop() {
        document.getElementById('pointsDisplay').textContent = this.points;
        
        // Update upgrade buttons
        Object.keys(this.upgrades).forEach(upgradeKey => {
            const button = document.getElementById(`${upgradeKey}Upgrade`);
            if (button) {
                const upgrade = CONFIG.UPGRADES[upgradeKey];
                const currentLevel = this.upgrades[upgradeKey];
                const cost = upgrade.cost * (currentLevel + 1);
                
                console.log(`${upgradeKey}: level=${currentLevel}, cost=${cost}, points=${this.points}, canAfford=${this.points >= cost}`);
                
                if (currentLevel >= upgrade.maxLevel) {
                    button.textContent = 'Max Level';
                    button.disabled = true;
                } else if (this.points >= cost) {
                    button.textContent = `Upgrade (${cost})`;
                    button.disabled = false;
                } else {
                    button.textContent = `Upgrade (${cost})`;
                    button.disabled = true;
                }
            }
        });
        
        // Update weapon purchase buttons
        for (let i = 1; i < 5; i++) {
            const button = document.getElementById(`buyWeapon${i}`);
            if (button) {
                const weaponCost = 50 * (i + 1);
                const isUnlocked = this.unlockedWeapons.includes(i);
                
                if (isUnlocked) {
                    button.textContent = 'Owned';
                    button.disabled = true;
                } else if (this.points >= weaponCost) {
                    button.textContent = `Buy (${weaponCost})`;
                    button.disabled = false;
                } else {
                    button.textContent = `Buy (${weaponCost})`;
                    button.disabled = true;
                }
            }
        }
        
        // Update category unlock button
        const unlockButton = document.getElementById('unlockCategory');
        if (unlockButton) {
            const lockedCategories = CONFIG.CATEGORIES.filter(cat => !cat.unlocked);
            const categoryCost = 100;
            
            if (lockedCategories.length === 0) {
                unlockButton.textContent = 'All Unlocked';
                unlockButton.disabled = true;
            } else if (this.points >= categoryCost) {
                unlockButton.textContent = `Unlock (${categoryCost})`;
                unlockButton.disabled = false;
            } else {
                unlockButton.textContent = `Unlock (${categoryCost})`;
                unlockButton.disabled = true;
            }
        }
    }
    
    // Add points
    addPoints(amount) {
        console.log(`Adding ${amount} points. Current: ${this.points}, New total: ${this.points + amount}`);
        this.points += amount;
        this.saveGame();
    }
    
    // Calculate dynamic health based on number of images in level
    calculateDynamicHealth(imageCount) {
        const baseHealth = CONFIG.BASE_HEALTH + (this.upgrades.maxHealth * CONFIG.UPGRADES.maxHealth.effect);
        // Health scales with image count - more images = more health
        const scaledHealth = Math.max(baseHealth, baseHealth + (imageCount * 5));
        return scaledHealth;
    }
    
    // Set health for current level based on image count
    setLevelHealth(imageCount) {
        this.maxHealth = this.calculateDynamicHealth(imageCount);
        this.health = this.maxHealth;
        this.updateHUD();
    }
    
    // Unlock a random locked level
    unlockRandomLevel() {
        const lockedCategories = CONFIG.CATEGORIES.filter(cat => !cat.unlocked);
        
        if (lockedCategories.length === 0) {
            return null; // All levels already unlocked
        }
        
        // Pick a random locked category
        const randomIndex = Math.floor(Math.random() * lockedCategories.length);
        const unlockedCategory = lockedCategories[randomIndex];
        
        // Unlock it
        unlockedCategory.unlocked = true;
        this.unlockedCategories.push(unlockedCategory.id);
        
        return unlockedCategory;
    }
    
    // Take damage as percentage of total health
    takeDamagePercentage() {
        // Take 2 health points per error for base health of 6 (3 mistakes before death)
        const damageAmount = 2;
        this.health -= damageAmount;
        if (this.health <= 0) {
            this.health = 0;
            
            // Play level failed sound
            soundManager.play('levelFailed');
            
            this.setState('levelFailed');
        }
        this.updateHUD();
    }
    
    // Take damage (legacy method for compatibility)
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.setState('levelFailed');
        }
        this.updateHUD();
    }
    
    // Heal
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHUD();
    }
    
    // Add score
    addScore(amount) {
        this.score += amount;
        this.updateHUD();
    }
    
    // Complete level
    completeLevel() {
        // Update high score
        const category = CONFIG.CATEGORIES.find(cat => cat.id === this.currentCategory);
        if (category && this.score > category.highScore) {
            category.highScore = this.score;
        }
        
        // Check if score is over 30 and unlock random level
        let randomLevelUnlocked = null;
        if (this.score > 30) {
            randomLevelUnlocked = this.unlockRandomLevel();
        }
        
        // Unlock next weapon - REMOVED: Weapons now must be purchased with points
        // if (this.unlockedWeapons.length < CONFIG.WEAPONS.length) {
        //     this.unlockedWeapons.push(this.unlockedWeapons.length);
        // }
        
        // Unlock next category - REMOVED: Categories now must be unlocked manually or with points
        // const lockedCategories = CONFIG.CATEGORIES.filter(cat => !cat.unlocked);
        // if (lockedCategories.length > 0) {
        //     const nextCategory = lockedCategories[0];
        //     nextCategory.unlocked = true;
        //     this.unlockedCategories.push(nextCategory.id);
        // }
        
        // Calculate points earned this level for display
        const gameplayPoints = Math.floor(this.score / 10); // Points from gameplay actions (1 per correct action)
        const bonusPoints = Math.floor(this.score / 5); // Bonus points from completion
        const totalPointsEarned = gameplayPoints + bonusPoints;
        
        // Store points earned this level for display
        this.pointsEarnedThisLevel = totalPointsEarned;
        
        // Store random level unlock info for display
        this.randomLevelUnlocked = randomLevelUnlocked;
        
        // Add meaningful bonus points based on score (since points are now earned during gameplay)
        this.addPoints(Math.floor(this.score / 5));
        
        // Play level complete sound
        soundManager.play('levelComplete');
        
        this.saveGame();
        this.setState('levelComplete');
    }
    
    // Get current weapon stats with upgrades
    getWeaponStats() {
        const weapon = CONFIG.WEAPONS[this.currentWeapon];
        return {
            fireRate: Math.max(50, weapon.fireRate - (this.upgrades.fireRate * CONFIG.UPGRADES.fireRate.effect)),
            damage: weapon.damage + (this.upgrades.damage * CONFIG.UPGRADES.damage.effect),
            bulletSpeed: weapon.bulletSpeed + (this.upgrades.bulletSpeed * CONFIG.UPGRADES.bulletSpeed.effect),
            spread: weapon.spread,
            bullets: weapon.bullets
        };
    }
    
    // Get player stats with upgrades
    getPlayerStats() {
        const stats = {
            speed: CONFIG.PLAYER_SPEED + (this.upgrades.speed * CONFIG.UPGRADES.speed.effect),
            jumpHeight: CONFIG.PLAYER_JUMP_FORCE - (this.upgrades.jumpHeight * CONFIG.UPGRADES.jumpHeight.effect),
            reachability: this.upgrades.reachability * CONFIG.UPGRADES.reachability.effect, // Additional jump height from reachability
            doubleJump: this.upgrades.doubleJump > 0,
            baseMaxHealth: CONFIG.BASE_HEALTH + (this.upgrades.maxHealth * CONFIG.UPGRADES.maxHealth.effect),
            shield: this.upgrades.shield > 0
        };
        
        
        
        return stats;
    }
    
    // Buy weapon with points
    buyWeapon(weaponIndex) {
        const weaponCost = 50 * (weaponIndex + 1); // Increasing cost per weapon
        
        if (!this.unlockedWeapons.includes(weaponIndex) && this.points >= weaponCost) {
            this.points -= weaponCost;
            this.unlockedWeapons.push(weaponIndex);
            this.saveGame();
            this.updateUpgradeShop();
            return true;
        }
        return false;
    }
    
    // Unlock category with points
    unlockCategory(categoryId) {
        const categoryCost = 100; // Fixed cost per category
        const category = CONFIG.CATEGORIES.find(cat => cat.id === categoryId);
        
        if (category && !category.unlocked && this.points >= categoryCost) {
            this.points -= categoryCost;
            category.unlocked = true;
            this.unlockedCategories.push(categoryId);
            this.saveGame();
            return true;
        }
        return false;
    }
    
    // Buy upgrade
    buyUpgrade(upgradeKey) {
        const upgrade = CONFIG.UPGRADES[upgradeKey];
        const currentLevel = this.upgrades[upgradeKey];
        const cost = upgrade.cost * (currentLevel + 1);
        
        if (currentLevel < upgrade.maxLevel && this.points >= cost) {
            this.points -= cost;
            this.upgrades[upgradeKey]++;
            this.saveGame();
            this.updateUpgradeShop();
            return true;
        }
        return false;
    }
    
    // Start new level
    startLevel(categoryId) {
        this.currentCategory = categoryId;
        this.score = 0;
        this.health = this.getPlayerStats().maxHealth;
        this.maxHealth = this.health;
        this.setState('playing');
    }
    
    // Reset game
    resetGame() {
        this.score = 0;
        this.health = this.getPlayerStats().maxHealth;
        this.maxHealth = this.health;
        this.currentCategory = null;
        this.setState('mainMenu');
    }
}

// Global game state instance
let gameState;
