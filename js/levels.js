// Level configuration system
const LEVELS = {
    maxLevel: 10,
    
    // Get level configuration for a specific level
    getLevel(level) {
        // If level is beyond max, return the highest level
        if (level > this.maxLevel) {
            return this.levelConfigs[this.maxLevel];
        }
        
        return this.levelConfigs[level] || this.levelConfigs[1];
    },
    
    // Level configurations
    levelConfigs: {
        // Level 1: Basic pattern recognition, slower speed
        1: {
            name: "Pattern Recognition",
            description: "Identify and predict basic patterns",
            time: 60, // Seconds to complete level
            targetScore: 50,
            patternCount: 1, // Number of simultaneous patterns
            patternTypes: ['sequence'], // Available pattern types
            complexity: 0.2, // Pattern complexity (0-1)
            speed: 0.2, // Speed of pattern evolution (0-1)
            noiseLevel: 0.1, // Amount of noise/randomness (0-1)
        },
        
        // Level 2: Introduces geometric patterns
        2: {
            name: "Geometric Insight",
            description: "Recognize geometric relationships",
            time: 60,
            targetScore: 120,
            patternCount: 1,
            patternTypes: ['sequence', 'geometric'],
            complexity: 0.3,
            speed: 0.3,
            noiseLevel: 0.2,
        },
        
        // Level 3: Faster patterns
        3: {
            name: "Speed Recognition",
            description: "Identify patterns with increased time pressure",
            time: 60,
            targetScore: 200,
            patternCount: 1,
            patternTypes: ['sequence', 'geometric'],
            complexity: 0.3,
            speed: 0.4,
            noiseLevel: 0.2,
        },
        
        // Level 4: Introduces multiple simultaneous patterns
        4: {
            name: "Multi-Tracking",
            description: "Track and predict multiple patterns simultaneously",
            time: 60,
            targetScore: 300,
            patternCount: 2,
            patternTypes: ['sequence', 'geometric'],
            complexity: 0.3,
            speed: 0.4,
            noiseLevel: 0.2,
        },
        
        // Level 5: Introduces convergence patterns
        5: {
            name: "Convergence Thinking",
            description: "Predict where multiple elements will converge",
            time: 60,
            targetScore: 400,
            patternCount: 2,
            patternTypes: ['sequence', 'geometric', 'convergence'],
            complexity: 0.4,
            speed: 0.4,
            noiseLevel: 0.3,
        },
        
        // Level 6: Higher noise level
        6: {
            name: "Signal Detection",
            description: "Filter signal from noise to identify true patterns",
            time: 60,
            targetScore: 500,
            patternCount: 2,
            patternTypes: ['sequence', 'geometric', 'convergence'],
            complexity: 0.5,
            speed: 0.5,
            noiseLevel: 0.5,
        },
        
        // Level 7: Higher complexity, multiple patterns
        7: {
            name: "Complex Integration",
            description: "Process multiple complex patterns simultaneously",
            time: 60,
            targetScore: 600,
            patternCount: 3,
            patternTypes: ['sequence', 'geometric', 'convergence'],
            complexity: 0.6,
            speed: 0.5,
            noiseLevel: 0.4,
        },
        
        // Level 8: Faster speed with higher complexity
        8: {
            name: "Rapid Processing",
            description: "Process complex patterns with increased time pressure",
            time: 60,
            targetScore: 700,
            patternCount: 3,
            patternTypes: ['sequence', 'geometric', 'convergence'],
            complexity: 0.6,
            speed: 0.7,
            noiseLevel: 0.4,
        },
        
        // Level 9: High complexity, high noise
        9: {
            name: "Noise Filtering",
            description: "Identify complex patterns through significant noise",
            time: 60,
            targetScore: 800,
            patternCount: 3,
            patternTypes: ['sequence', 'geometric', 'convergence'],
            complexity: 0.7,
            speed: 0.6,
            noiseLevel: 0.7,
        },
        
        // Level 10: Maximum challenge
        10: {
            name: "Dimensional Intelligence",
            description: "The ultimate test of your pattern recognition abilities",
            time: 60,
            targetScore: 1000,
            patternCount: 4,
            patternTypes: ['sequence', 'geometric', 'convergence'],
            complexity: 0.8,
            speed: 0.8,
            noiseLevel: 0.6,
        }
    },
    
    // Get the description for a specific level
    getLevelDescription(level) {
        const config = this.getLevel(level);
        return {
            name: config.name,
            description: config.description,
            targetScore: config.targetScore,
            patternCount: config.patternCount
        };
    },
    
    // Get a performance rating based on score and level
    getRating(score, level) {
        const levelConfig = this.getLevel(level);
        const targetScore = levelConfig.targetScore;
        
        if (score >= targetScore * 1.5) {
            return {
                rating: "Exceptional",
                description: "Your pattern recognition abilities are outstanding, comparable to top performers in their fields."
            };
        } else if (score >= targetScore * 1.2) {
            return {
                rating: "Advanced",
                description: "You demonstrate advanced pattern recognition, seeing connections that most people miss."
            };
        } else if (score >= targetScore) {
            return {
                rating: "Proficient",
                description: "You show strong pattern recognition abilities, processing information efficiently."
            };
        } else if (score >= targetScore * 0.7) {
            return {
                rating: "Developing",
                description: "Your pattern recognition skills are developing. With practice, you'll see more connections."
            };
        } else {
            return {
                rating: "Novice",
                description: "You're building fundamental pattern recognition. Regular practice will strengthen this ability."
            };
        }
    }
}