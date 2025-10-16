// Game Configuration
const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    
    // Game settings
    GRAVITY: 0.8,
    FRICTION: 0.85,
    PLAYER_SPEED: 6,
    PLAYER_JUMP_FORCE: -18,
    
    // Dynamic health system
    BASE_HEALTH: 6,
    ERROR_HEALTH_PERCENTAGE: 0.167, // ~16.7% of total health per error (1/6 = 6 errors before death)
    
    // Categories (15 total, 5 unlocked initially)
    CATEGORIES: [
        { id: 'dogs', name: 'Dogs', unlocked: true, highScore: 0 },
        { id: 'cats', name: 'Cats', unlocked: true, highScore: 0 },
        { id: 'cars', name: 'Cars', unlocked: true, highScore: 0 },
        { id: 'food', name: 'Food', unlocked: true, highScore: 0 },
        { id: 'nature', name: 'Nature', unlocked: true, highScore: 0 },
        { id: 'buildings', name: 'Buildings', unlocked: false, highScore: 0 },
        { id: 'people', name: 'People', unlocked: false, highScore: 0 },
        { id: 'animals', name: 'Animals', unlocked: false, highScore: 0 },
        { id: 'art', name: 'Art', unlocked: false, highScore: 0 },
        { id: 'music', name: 'Music', unlocked: false, highScore: 0 },
        { id: 'fashion', name: 'Fashion', unlocked: false, highScore: 0 },
        { id: 'space', name: 'Space', unlocked: false, highScore: 0 },
        { id: 'fantasy', name: 'Fantasy', unlocked: false, highScore: 0 },
        { id: 'abstract', name: 'Abstract', unlocked: false, highScore: 0 },
        { id: 'minimalist', name: 'Minimalist', unlocked: false, highScore: 0 }
    ],
    
    // Image placeholder data for each category
    IMAGE_DATA: {
        dogs: {
            real: [
                { text: 'REAL: Golden Retriever', color: '#3498db' },
                { text: 'REAL: German Shepherd', color: '#3498db' },
                { text: 'REAL: Labrador', color: '#3498db' },
                { text: 'REAL: Poodle', color: '#3498db' },
                { text: 'REAL: Beagle', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Dog with 6 legs', color: '#e74c3c' },
                { text: 'AI: Floating dog head', color: '#e74c3c' },
                { text: 'AI: Dog with human hands', color: '#e74c3c' },
                { text: 'AI: Glowing dog eyes', color: '#e74c3c' },
                { text: 'AI: Dog in impossible pose', color: '#e74c3c' }
            ]
        },
        cats: {
            real: [
                { text: 'REAL: Persian Cat', color: '#3498db' },
                { text: 'REAL: Siamese Cat', color: '#3498db' },
                { text: 'REAL: Maine Coon', color: '#3498db' },
                { text: 'REAL: Tabby Cat', color: '#3498db' },
                { text: 'REAL: Orange Cat', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Cat with wings', color: '#e74c3c' },
                { text: 'AI: Cat with extra tails', color: '#e74c3c' },
                { text: 'AI: Floating cat', color: '#e74c3c' },
                { text: 'AI: Cat with human face', color: '#e74c3c' },
                { text: 'AI: Glowing cat', color: '#e74c3c' }
            ]
        },
        cars: {
            real: [
                { text: 'REAL: Sedan', color: '#3498db' },
                { text: 'REAL: SUV', color: '#3498db' },
                { text: 'REAL: Sports Car', color: '#3498db' },
                { text: 'REAL: Truck', color: '#3498db' },
                { text: 'REAL: Hatchback', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Car with legs', color: '#e74c3c' },
                { text: 'AI: Flying car', color: '#e74c3c' },
                { text: 'AI: Car with eyes', color: '#e74c3c' },
                { text: 'AI: Transparent car', color: '#e74c3c' },
                { text: 'AI: Car in water', color: '#e74c3c' }
            ]
        },
        food: {
            real: [
                { text: 'REAL: Pizza', color: '#3498db' },
                { text: 'REAL: Burger', color: '#3498db' },
                { text: 'REAL: Salad', color: '#3498db' },
                { text: 'REAL: Pasta', color: '#3498db' },
                { text: 'REAL: Sandwich', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating food', color: '#e74c3c' },
                { text: 'AI: Food with faces', color: '#e74c3c' },
                { text: 'AI: Glowing food', color: '#e74c3c' },
                { text: 'AI: Food in space', color: '#e74c3c' },
                { text: 'AI: Melting food', color: '#e74c3c' }
            ]
        },
        nature: {
            real: [
                { text: 'REAL: Forest', color: '#3498db' },
                { text: 'REAL: Mountain', color: '#3498db' },
                { text: 'REAL: Ocean', color: '#3498db' },
                { text: 'REAL: Sunset', color: '#3498db' },
                { text: 'REAL: Lake', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating trees', color: '#e74c3c' },
                { text: 'AI: Rainbow mountains', color: '#e74c3c' },
                { text: 'AI: Glowing ocean', color: '#e74c3c' },
                { text: 'AI: Purple sky', color: '#e74c3c' },
                { text: 'AI: Upside down lake', color: '#e74c3c' }
            ]
        },
        // Add more categories with similar structure...
        buildings: {
            real: [
                { text: 'REAL: House', color: '#3498db' },
                { text: 'REAL: Skyscraper', color: '#3498db' },
                { text: 'REAL: Church', color: '#3498db' },
                { text: 'REAL: Bridge', color: '#3498db' },
                { text: 'REAL: Castle', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating building', color: '#e74c3c' },
                { text: 'AI: Building with legs', color: '#e74c3c' },
                { text: 'AI: Glowing building', color: '#e74c3c' },
                { text: 'AI: Upside down building', color: '#e74c3c' },
                { text: 'AI: Building in space', color: '#e74c3c' }
            ]
        },
        people: {
            real: [
                { text: 'REAL: Portrait', color: '#3498db' },
                { text: 'REAL: Family', color: '#3498db' },
                { text: 'REAL: Friends', color: '#3498db' },
                { text: 'REAL: Wedding', color: '#3498db' },
                { text: 'REAL: Graduation', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Extra fingers', color: '#e74c3c' },
                { text: 'AI: Floating hands', color: '#e74c3c' },
                { text: 'AI: Glowing eyes', color: '#e74c3c' },
                { text: 'AI: Wrong proportions', color: '#e74c3c' },
                { text: 'AI: Merged faces', color: '#e74c3c' }
            ]
        },
        animals: {
            real: [
                { text: 'REAL: Lion', color: '#3498db' },
                { text: 'REAL: Elephant', color: '#3498db' },
                { text: 'REAL: Bird', color: '#3498db' },
                { text: 'REAL: Fish', color: '#3498db' },
                { text: 'REAL: Bear', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Lion with wings', color: '#e74c3c' },
                { text: 'AI: Elephant with trunk', color: '#e74c3c' },
                { text: 'AI: Bird with arms', color: '#e74c3c' },
                { text: 'AI: Fish with legs', color: '#e74c3c' },
                { text: 'AI: Bear with horns', color: '#e74c3c' }
            ]
        },
        art: {
            real: [
                { text: 'REAL: Painting', color: '#3498db' },
                { text: 'REAL: Sculpture', color: '#3498db' },
                { text: 'REAL: Drawing', color: '#3498db' },
                { text: 'REAL: Photography', color: '#3498db' },
                { text: 'REAL: Mural', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating art', color: '#e74c3c' },
                { text: 'AI: Glowing art', color: '#e74c3c' },
                { text: 'AI: Melting art', color: '#e74c3c' },
                { text: 'AI: Art with faces', color: '#e74c3c' },
                { text: 'AI: Upside down art', color: '#e74c3c' }
            ]
        },
        music: {
            real: [
                { text: 'REAL: Guitar', color: '#3498db' },
                { text: 'REAL: Piano', color: '#3498db' },
                { text: 'REAL: Drums', color: '#3498db' },
                { text: 'REAL: Violin', color: '#3498db' },
                { text: 'REAL: Microphone', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating instrument', color: '#e74c3c' },
                { text: 'AI: Glowing instrument', color: '#e74c3c' },
                { text: 'AI: Instrument with eyes', color: '#e74c3c' },
                { text: 'AI: Melting instrument', color: '#e74c3c' },
                { text: 'AI: Instrument in space', color: '#e74c3c' }
            ]
        },
        fashion: {
            real: [
                { text: 'REAL: Dress', color: '#3498db' },
                { text: 'REAL: Suit', color: '#3498db' },
                { text: 'REAL: Shoes', color: '#3498db' },
                { text: 'REAL: Hat', color: '#3498db' },
                { text: 'REAL: Jacket', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating clothes', color: '#e74c3c' },
                { text: 'AI: Glowing clothes', color: '#e74c3c' },
                { text: 'AI: Clothes with faces', color: '#e74c3c' },
                { text: 'AI: Melting clothes', color: '#e74c3c' },
                { text: 'AI: Clothes in space', color: '#e74c3c' }
            ]
        },
        space: {
            real: [
                { text: 'REAL: Earth', color: '#3498db' },
                { text: 'REAL: Moon', color: '#3498db' },
                { text: 'REAL: Stars', color: '#3498db' },
                { text: 'REAL: Galaxy', color: '#3498db' },
                { text: 'REAL: Nebula', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating planet', color: '#e74c3c' },
                { text: 'AI: Glowing planet', color: '#e74c3c' },
                { text: 'AI: Planet with face', color: '#e74c3c' },
                { text: 'AI: Melting planet', color: '#e74c3c' },
                { text: 'AI: Planet with legs', color: '#e74c3c' }
            ]
        },
        fantasy: {
            real: [
                { text: 'REAL: Dragon', color: '#3498db' },
                { text: 'REAL: Unicorn', color: '#3498db' },
                { text: 'REAL: Castle', color: '#3498db' },
                { text: 'REAL: Wizard', color: '#3498db' },
                { text: 'REAL: Fairy', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating fantasy', color: '#e74c3c' },
                { text: 'AI: Glowing fantasy', color: '#e74c3c' },
                { text: 'AI: Fantasy with extra parts', color: '#e74c3c' },
                { text: 'AI: Melting fantasy', color: '#e74c3c' },
                { text: 'AI: Fantasy in wrong setting', color: '#e74c3c' }
            ]
        },
        abstract: {
            real: [
                { text: 'REAL: Shapes', color: '#3498db' },
                { text: 'REAL: Colors', color: '#3498db' },
                { text: 'REAL: Patterns', color: '#3498db' },
                { text: 'REAL: Textures', color: '#3498db' },
                { text: 'REAL: Lines', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating abstract', color: '#e74c3c' },
                { text: 'AI: Glowing abstract', color: '#e74c3c' },
                { text: 'AI: Abstract with faces', color: '#e74c3c' },
                { text: 'AI: Melting abstract', color: '#e74c3c' },
                { text: 'AI: Abstract in space', color: '#e74c3c' }
            ]
        },
        minimalist: {
            real: [
                { text: 'REAL: Simple design', color: '#3498db' },
                { text: 'REAL: Clean lines', color: '#3498db' },
                { text: 'REAL: White space', color: '#3498db' },
                { text: 'REAL: Basic shapes', color: '#3498db' },
                { text: 'REAL: Monochrome', color: '#3498db' }
            ],
            ai: [
                { text: 'AI: Floating minimalist', color: '#e74c3c' },
                { text: 'AI: Glowing minimalist', color: '#e74c3c' },
                { text: 'AI: Minimalist with extra', color: '#e74c3c' },
                { text: 'AI: Melting minimalist', color: '#e74c3c' },
                { text: 'AI: Minimalist in space', color: '#e74c3c' }
            ]
        }
    },
    
    // Weapon configurations
    WEAPONS: [
        {
            id: 'pistol',
            name: 'Basic Pistol',
            unlocked: true,
            fireRate: 300,
            damage: 1,
            bulletSpeed: 8,
            spread: 0,
            bullets: 1,
            description: 'Standard issue weapon'
        },
        {
            id: 'spread',
            name: 'Spread Shot',
            unlocked: false,
            fireRate: 500,
            damage: 0.7,
            bulletSpeed: 6,
            spread: 15,
            bullets: 3,
            description: 'Fires multiple bullets'
        },
        {
            id: 'rapid',
            name: 'Rapid Fire',
            unlocked: false,
            fireRate: 100,
            damage: 0.5,
            bulletSpeed: 10,
            spread: 5,
            bullets: 1,
            description: 'High fire rate, low damage'
        },
        {
            id: 'laser',
            name: 'Laser Beam',
            unlocked: false,
            fireRate: 50,
            damage: 2,
            bulletSpeed: 15,
            spread: 0,
            bullets: 1,
            description: 'Powerful continuous beam'
        },
        {
            id: 'bounce',
            name: 'Bouncing Bullets',
            unlocked: false,
            fireRate: 400,
            damage: 1.2,
            bulletSpeed: 7,
            spread: 0,
            bullets: 1,
            description: 'Bullets ricochet off surfaces'
        },
        {
            id: 'explosive',
            name: 'Explosive Rounds',
            unlocked: false,
            fireRate: 600,
            damage: 3,
            bulletSpeed: 5,
            spread: 0,
            bullets: 1,
            description: 'Explodes on impact'
        }
    ],
    
    // Upgrade costs and effects (reduced to 1/3 of original costs)
    UPGRADES: {
        speed: { cost: 17, maxLevel: 5, effect: 0.8 },
        jumpHeight: { cost: 25, maxLevel: 3, effect: 2 },
        doubleJump: { cost: 33, maxLevel: 1, effect: 1 },
        reachability: { cost: 30, maxLevel: 4, effect: 3 }, // New upgrade for higher jumps
        fireRate: { cost: 20, maxLevel: 5, effect: -50 },
        damage: { cost: 27, maxLevel: 5, effect: 0.2 },
        bulletSpeed: { cost: 13, maxLevel: 5, effect: 1 },
        maxHealth: { cost: 30, maxLevel: 3, effect: 20 },
        shield: { cost: 40, maxLevel: 1, effect: 1 }
    },
    
    // Funny AI-related completion messages
    COMPLETION_MESSAGES: [
        "Another AI slop pile defeated! 🎯",
        "You're getting good at spotting the fakes! 👁️",
        "The machines are learning... but you're learning faster! 🤖",
        "AI art has nothing on your aim! 🎨",
        "You've successfully identified more fake images than a reverse image search! 🔍",
        "The algorithm is crying in binary! 😭",
        "You've become the ultimate AI detector! 🕵️",
        "Even ChatGPT would be impressed! 🤖",
        "You've mastered the art of spotting artificial art! 🎭",
        "The AI uprising has been postponed indefinitely! 🚫"
    ]
};
