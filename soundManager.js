// Sound Manager - Handles all game audio
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.loadSounds();
    }
    
    // Load all sound effects
    loadSounds() {
        // Create audio contexts for different sound types
        this.sounds = {
            shoot: this.createSound('shoot'),
            jump: this.createSound('jump'),
            correct: this.createSound('correct'),
            incorrect: this.createSound('incorrect'),
            levelComplete: this.createSound('levelComplete'),
            levelFailed: this.createSound('levelFailed')
        };
    }
    
    // Create a sound object with Web Audio API
    createSound(soundType) {
        return {
            play: () => {
                if (!this.enabled) return;
                
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Create different sound patterns for each type
                    if (soundType === 'shoot') {
                        this.playShootSound(audioContext);
                    } else if (soundType === 'jump') {
                        this.playJumpSound(audioContext);
                    } else if (soundType === 'correct') {
                        this.playCorrectSound(audioContext);
                    } else if (soundType === 'incorrect') {
                        this.playIncorrectSound(audioContext);
                    } else if (soundType === 'levelComplete') {
                        this.playLevelCompleteSound(audioContext);
                    } else if (soundType === 'levelFailed') {
                        this.playLevelFailedSound(audioContext);
                    }
                } catch (e) {
                    console.log('Audio playback failed:', e);
                }
            }
        };
    }
    
    // Shoot sound - quick sharp "pew" sound
    playShootSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(this.volume * 0.7, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }
    
    // Jump sound - bouncy "boing" sound
    playJumpSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.8, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // Correct sound - pleasant "ding" sound
    playCorrectSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.08);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.6, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
    }
    
    // Incorrect sound - harsh "buzz" sound
    playIncorrectSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.12);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(this.volume * 0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
    }
    
    // Level complete sound - triumphant "fanfare" sound
    playLevelCompleteSound(audioContext) {
        // Play a short ascending melody
        const notes = [440, 554, 659, 880]; // A, C#, E, A
        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.volume * 0.4, audioContext.currentTime + index * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.08);
            
            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + index * 0.1 + 0.08);
        });
    }
    
    // Level failed sound - sad descending "wah" sound
    playLevelFailedSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(this.volume * 0.6, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    // Play a specific sound
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
    
    // Toggle sound on/off
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Create global sound manager
const soundManager = new SoundManager();
