// Main game controller
const GAME = {
    state: 'MENU', // MENU, PLAYING, PAUSED, GAMEOVER
    score: 0,
    level: 1,
    timeRemaining: 60,
    patternHistory: [],
    activePatterns: [],
    canvas: null,
    width: 0,
    height: 0,
    lastTimestamp: 0,
    frameCount: 0,
    
    // Game initialization
    init() {
        // Setup p5.js sketch
        const sketch = (p) => {
            p.setup = () => {
                const container = document.getElementById('canvas-container');
                GAME.width = container.offsetWidth;
                GAME.height = container.offsetHeight;
                GAME.canvas = p.createCanvas(GAME.width, GAME.height);
                GAME.canvas.parent('canvas-container');
                
                // Set some common p5 settings
                p.textFont('Montserrat');
                p.textAlign(p.CENTER, p.CENTER);
                p.rectMode(p.CENTER);
                p.ellipseMode(p.CENTER);
                
                // Initialize patterns module
                PATTERNS.init(p);
                
                // Setup event listeners for window resize
                window.addEventListener('resize', () => {
                    const container = document.getElementById('canvas-container');
                    GAME.width = container.offsetWidth;
                    GAME.height = container.offsetHeight;
                    p.resizeCanvas(GAME.width, GAME.height);
                });
            };
            
            p.draw = () => {
                // Main game loop
                const currentTime = p.millis();
                const deltaTime = currentTime - GAME.lastTimestamp;
                GAME.lastTimestamp = currentTime;
                GAME.frameCount++;
                
                // Clear the background
                p.background(10, 10, 22);
                
                // Draw background grid/effects
                drawBackground(p);
                
                // State machine for game states
                switch (GAME.state) {
                    case 'MENU':
                        drawMenu(p);
                        break;
                    case 'PLAYING':
                        updateGame(p, deltaTime);
                        drawGame(p);
                        break;
                    case 'PAUSED':
                        drawGame(p);
                        drawPaused(p);
                        break;
                    case 'GAMEOVER':
                        drawGame(p);
                        drawGameOver(p);
                        break;
                }
            };
            
            p.mousePressed = () => {
                if (GAME.state === 'PLAYING') {
                    // Get the current height to check against active patterns
                    const x = p.mouseX;
                    const y = p.mouseY;
                    
                    // Check if the click hit any active patterns
                    let hitPattern = false;
                    
                    GAME.activePatterns.forEach(pattern => {
                        // Only register clicks on patterns that are in prediction phase
                        if (pattern.state === 'prediction' && pattern.checkClick(x, y)) {
                            hitPattern = true;
                            pattern.onCorrectPrediction();
                            GAME.score += pattern.getPoints();
                            UI.updateScore(GAME.score);
                            
                            // Add visual feedback
                            EFFECTS.addEffect(new SuccessEffect(x, y));
                        }
                    });
                    
                    // If no pattern was hit, penalty
                    if (!hitPattern && GAME.activePatterns.length > 0) {
                        GAME.score = Math.max(0, GAME.score - 5);
                        UI.updateScore(GAME.score);
                        
                        // Add visual feedback for miss
                        EFFECTS.addEffect(new MissEffect(x, y));
                    }
                }
            };
        };
        
        new p5(sketch);
        
        // Set up event listeners
        document.getElementById('start-btn').addEventListener('click', () => {
            GAME.startGame();
        });
        
        document.getElementById('tutorial-btn').addEventListener('click', () => {
            UI.showModal('tutorial');
        });
        
        // Show welcome modal on first load
        UI.showModal('welcome');
    },
    
    startGame() {
        GAME.state = 'PLAYING';
        GAME.score = 0;
        GAME.level = 1;
        GAME.timeRemaining = LEVELS.getLevel(1).time;
        GAME.activePatterns = [];
        GAME.patternHistory = [];
        
        UI.updateScore(GAME.score);
        UI.updateLevel(GAME.level);
        UI.updateTime(GAME.timeRemaining);
        
        // Hide start button, show pause button
        document.getElementById('start-btn').textContent = 'Restart';
        
        // Start the timer
        GAME.timer = setInterval(() => {
            if (GAME.state === 'PLAYING') {
                GAME.timeRemaining--;
                UI.updateTime(GAME.timeRemaining);
                
                if (GAME.timeRemaining <= 0) {
                    GAME.endGame();
                }
            }
        }, 1000);
        
        // Initialize the first patterns
        GAME.spawnPatterns();
    },
    
    spawnPatterns() {
        const levelConfig = LEVELS.getLevel(GAME.level);
        
        // Clear existing patterns that are complete
        GAME.activePatterns = GAME.activePatterns.filter(p => !p.isComplete);
        
        // Add new patterns if we're below the count for this level
        const neededPatterns = levelConfig.patternCount - GAME.activePatterns.length;
        
        for (let i = 0; i < neededPatterns; i++) {
            const newPattern = PATTERNS.createRandomPattern(levelConfig);
            GAME.activePatterns.push(newPattern);
        }
    },
    
    advanceLevel() {
        GAME.level++;
        const levelConfig = LEVELS.getLevel(GAME.level);
        GAME.timeRemaining = levelConfig.time;
        
        UI.updateLevel(GAME.level);
        UI.updateTime(GAME.timeRemaining);
        
        // Show level notification
        UI.showLevelNotification(GAME.level);
        
        // Clear patterns and spawn new ones
        GAME.activePatterns = [];
        GAME.spawnPatterns();
    },
    
    pauseGame() {
        if (GAME.state === 'PLAYING') {
            GAME.state = 'PAUSED';
        } else if (GAME.state === 'PAUSED') {
            GAME.state = 'PLAYING';
        }
    },
    
    endGame() {
        GAME.state = 'GAMEOVER';
        clearInterval(GAME.timer);
        
        // Show game over modal with final score
        UI.showGameOverModal(GAME.score, GAME.level);
    }
};

// Update game state
function updateGame(p, deltaTime) {
    // Process active patterns
    GAME.activePatterns.forEach(pattern => {
        pattern.update(deltaTime / 1000); // Convert to seconds
    });
    
    // Check for completed patterns
    const completedCount = GAME.activePatterns.filter(p => p.isComplete).length;
    
    // If all patterns are complete, spawn new ones
    if (completedCount === GAME.activePatterns.length) {
        GAME.spawnPatterns();
    }
    
    // Check if we should advance to the next level
    const levelConfig = LEVELS.getLevel(GAME.level);
    if (GAME.score >= levelConfig.targetScore && GAME.level < LEVELS.maxLevel) {
        GAME.advanceLevel();
    }
    
    // Update any visual effects
    EFFECTS.update(deltaTime / 1000);
}

// Draw game elements
function drawGame(p) {
    // Draw active patterns
    GAME.activePatterns.forEach(pattern => {
        pattern.draw();
    });
    
    // Draw any visual effects
    EFFECTS.draw();
}

// Draw menu state
function drawMenu(p) {
    p.fill(255, 255, 255, 100);
    p.textSize(24);
    p.text('Press START to begin', GAME.width / 2, GAME.height / 2);
}

// Draw pause overlay
function drawPaused(p) {
    p.fill(0, 0, 0, 150);
    p.rect(GAME.width / 2, GAME.height / 2, GAME.width, GAME.height);
    
    p.fill(255);
    p.textSize(36);
    p.text('PAUSED', GAME.width / 2, GAME.height / 2 - 30);
    
    p.textSize(18);
    p.text('Click anywhere to continue', GAME.width / 2, GAME.height / 2 + 30);
}

// Draw game over overlay
function drawGameOver(p) {
    p.fill(0, 0, 0, 150);
    p.rect(GAME.width / 2, GAME.height / 2, GAME.width, GAME.height);
    
    p.fill(255);
    p.textSize(36);
    p.text('GAME OVER', GAME.width / 2, GAME.height / 2 - 50);
    
    p.textSize(24);
    p.text(`Final Score: ${GAME.score}`, GAME.width / 2, GAME.height / 2);
    p.text(`Level Reached: ${GAME.level}`, GAME.width / 2, GAME.height / 2 + 40);
}

// Draw background elements
function drawBackground(p) {
    // Draw subtle grid
    p.stroke(255, 255, 255, 10);
    p.strokeWeight(1);
    
    const gridSize = 40;
    
    // Vertical lines
    for (let x = 0; x < GAME.width; x += gridSize) {
        p.line(x, 0, x, GAME.height);
    }
    
    // Horizontal lines
    for (let y = 0; y < GAME.height; y += gridSize) {
        p.line(0, y, GAME.width, y);
    }
    
    // Add some floating particles
    drawParticles(p);
}

// Particles in the background
const particles = [];
function drawParticles(p) {
    // Initialize particles if not already done
    if (particles.length === 0) {
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: p.random(GAME.width),
                y: p.random(GAME.height),
                size: p.random(1, 3),
                speed: p.random(0.2, 1),
                color: p.color(
                    p.random([58, 131, 246]), 
                    p.random([16, 103, 255]), 
                    p.random([229, 199, 255]), 
                    p.random(50, 150)
                )
            });
        }
    }
    
    // Draw and update particles
    p.noStroke();
    
    particles.forEach(particle => {
        p.fill(particle.color);
        p.ellipse(particle.x, particle.y, particle.size);
        
        // Move particle
        particle.y += particle.speed;
        
        // Reset if off screen
        if (particle.y > GAME.height) {
            particle.y = 0;
            particle.x = p.random(GAME.width);
        }
    });
}

// Initialize the game when page is loaded
window.addEventListener('load', GAME.init);

// Visual effects system
const EFFECTS = {
    activeEffects: [],
    
    addEffect(effect) {
        this.activeEffects.push(effect);
    },
    
    update(deltaTime) {
        this.activeEffects.forEach(effect => effect.update(deltaTime));
        this.activeEffects = this.activeEffects.filter(effect => !effect.isComplete);
    },
    
    draw() {
        this.activeEffects.forEach(effect => effect.draw());
    }
};

// Success effect when correctly predicting a pattern
class SuccessEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 50;
        this.duration = 0.5; // seconds
        this.elapsed = 0;
        this.isComplete = false;
    }
    
    update(deltaTime) {
        this.elapsed += deltaTime;
        this.radius = (this.elapsed / this.duration) * this.maxRadius;
        
        if (this.elapsed >= this.duration) {
            this.isComplete = true;
        }
    }
    
    draw() {
        const p = PATTERNS.p5;
        const alpha = 255 * (1 - this.elapsed / this.duration);
        
        p.noFill();
        p.stroke(0, 245, 160, alpha);
        p.strokeWeight(2);
        p.circle(this.x, this.y, this.radius * 2);
    }
}

// Miss effect when clicking incorrectly
class MissEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.duration = 0.3; // seconds
        this.elapsed = 0;
        this.isComplete = false;
    }
    
    update(deltaTime) {
        this.elapsed += deltaTime;
        
        if (this.elapsed >= this.duration) {
            this.isComplete = true;
        }
    }
    
    draw() {
        const p = PATTERNS.p5;
        const alpha = 255 * (1 - this.elapsed / this.duration);
        
        p.stroke(255, 56, 96, alpha);
        p.strokeWeight(2);
        p.noFill();
        
        const offset = this.size / 2;
        
        // Draw X
        p.line(this.x - offset, this.y - offset, this.x + offset, this.y + offset);
        p.line(this.x + offset, this.y - offset, this.x - offset, this.y + offset);
    }
}