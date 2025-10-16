// Weapon System
class WeaponSystem {
    constructor() {
        this.weapons = CONFIG.WEAPONS;
        this.currentWeaponIndex = 0;
    }
    
    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }
    
    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
        }
    }
    
    getUnlockedWeapons() {
        return this.weapons.filter((weapon, index) => 
            gameState.unlockedWeapons.includes(index)
        );
    }
    
    drawWeaponInfo(ctx, x, y) {
        const weapon = this.getCurrentWeapon();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, 200, 100);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Weapon: ${weapon.name}`, x + 10, y + 20);
        ctx.fillText(`Damage: ${weapon.damage}`, x + 10, y + 40);
        ctx.fillText(`Fire Rate: ${weapon.fireRate}ms`, x + 10, y + 60);
        ctx.fillText(`Bullets: ${weapon.bullets}`, x + 10, y + 80);
    }
}

// Upgrade System
class UpgradeSystem {
    constructor() {
        this.upgrades = CONFIG.UPGRADES;
    }
    
    getUpgradeCost(upgradeKey, currentLevel) {
        const upgrade = this.upgrades[upgradeKey];
        return upgrade.cost * (currentLevel + 1);
    }
    
    canAffordUpgrade(upgradeKey, currentLevel, points) {
        return points >= this.getUpgradeCost(upgradeKey, currentLevel);
    }
    
    getUpgradeEffect(upgradeKey, level) {
        const upgrade = this.upgrades[upgradeKey];
        return upgrade.effect * level;
    }
    
    drawUpgradePreview(ctx, x, y, upgradeKey, currentLevel) {
        const upgrade = this.upgrades[upgradeKey];
        const cost = this.getUpgradeCost(upgradeKey, currentLevel);
        const canAfford = gameState.points >= cost;
        
        ctx.fillStyle = canAfford ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(x, y, 250, 60);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        const upgradeName = upgradeKey.charAt(0).toUpperCase() + upgradeKey.slice(1);
        ctx.fillText(`${upgradeName} (Level ${currentLevel + 1})`, x + 10, y + 20);
        ctx.fillText(`Cost: ${cost} points`, x + 10, y + 40);
        
        if (currentLevel >= upgrade.maxLevel) {
            ctx.fillText('MAX LEVEL', x + 10, y + 55);
        }
    }
}

// Global instances
let weaponSystem;
let upgradeSystem;
