// Pattern system - Manages all pattern types and creation
const PATTERNS = {
    p5: null, // Will store the p5 instance
    
    // Pattern types available in the game
    types: [
        'sequence',   // Patterns that follow a predictable sequence
        'geometric',  // Patterns based on geometric shapes and positions
        'convergence' // Patterns that converge to a specific point
    ],
    
    // Initialize patterns module
    init(p) {
        this.p5 = p;
    },
    
    // Create a random pattern based on level configuration
    createRandomPattern(levelConfig) {
        const p = this.p5;
        
        // Choose a random pattern type from the available types
        // Filter based on what's allowed in the current level
        const availableTypes = this.types.filter(type => levelConfig.patternTypes.includes(type));
        const patternType = p.random(availableTypes);
        
        // Create the specific pattern type
        switch (patternType) {
            case 'sequence':
                return new SequencePattern(levelConfig);
            case 'geometric':
                return new GeometricPattern(levelConfig);
            case 'convergence':
                return new ConvergencePattern(levelConfig);
            default:
                return new SequencePattern(levelConfig); // Default fallback
        }
    }
};

// Base Pattern class - all specific patterns extend this
class Pattern {
    constructor(levelConfig) {
        this.p5 = PATTERNS.p5;
        this.isComplete = false;
        this.state = 'emergence'; // emergence, prediction, completed, failed
        this.emergeTime = 0;
        this.predictionTime = 0;
        this.timeElapsed = 0;
        
        // Difficulty settings from level config
        this.complexity = levelConfig.complexity;
        this.speed = levelConfig.speed;
        this.noiseLevel = levelConfig.noiseLevel;
        
        // Points for correct prediction
        this.basePoints = 10;
        this.timeBonus = 0;
    }
    
    // Update pattern state
    update(deltaTime) {
        this.timeElapsed += deltaTime;
        
        // State machine for pattern lifecycle
        switch (this.state) {
            case 'emergence':
                // Pattern is emerging/forming
                if (this.timeElapsed >= this.emergeTime) {
                    this.state = 'prediction';
                    this.timeElapsed = 0; // Reset timer for prediction phase
                }
                break;
                
            case 'prediction':
                // Time to predict where pattern will complete
                if (this.timeElapsed >= this.predictionTime) {
                    this.state = 'failed';
                    this.isComplete = true;
                }
                break;
                
            case 'completed':
            case 'failed':
                // Pattern is done, nothing to update
                break;
        }
    }
    
    // Check if a click hits this pattern (for prediction)
    checkClick(x, y) {
        // To be implemented by specific pattern types
        return false;
    }
    
    // Handle correct prediction
    onCorrectPrediction() {
        this.state = 'completed';
        this.isComplete = true;
        
        // Calculate time bonus - earlier prediction = higher bonus
        const timeRemaining = this.predictionTime - this.timeElapsed;
        this.timeBonus = Math.floor((timeRemaining / this.predictionTime) * this.basePoints);
    }
    
    // Get points for this pattern
    getPoints() {
        return this.basePoints + this.timeBonus;
    }
    
    // Draw the pattern
    draw() {
        // To be implemented by specific pattern types
    }
}

// Sequence Pattern - a sequence of elements that follow a predictable pattern
class SequencePattern extends Pattern {
    constructor(levelConfig) {
        super(levelConfig);
        
        const p = this.p5;
        const w = GAME.width;
        const h = GAME.height;
        
        // Pattern configuration
        this.elements = [];
        this.elementCount = 3 + Math.floor(this.complexity * 2); // More elements with higher complexity
        this.elementSize = p.random(15, 30);
        
        // Time settings
        this.emergeTime = 3 - (this.speed * 1.5); // 1.5 to 3 seconds based on speed
        this.predictionTime = 2 - (this.speed * 0.8); // 1.2 to 2 seconds based on speed
        
        // Color settings
        this.baseColor = p.color(58, 16, 229); // Primary blue
        this.highlightColor = p.color(246, 55, 236); // Accent pink
        
        // Create sequence type - can be horizontal, vertical, diagonal, or circular
        this.sequenceType = p.random(['horizontal', 'vertical', 'diagonal', 'circular']);
        
        // Starting position
        this.startX = p.random(w * 0.2, w * 0.8);
        this.startY = p.random(h * 0.2, h * 0.8);
        
        // Calculate sequence pattern
        this.calculateSequence();
        
        // Target position (where the next element will appear)
        this.targetX = this.elements[this.elementCount - 1].x;
        this.targetY = this.elements[this.elementCount - 1].y;
        
        // Click hit area
        this.targetRadius = this.elementSize * 1.5;
    }
    
    calculateSequence() {
        const p = this.p5;
        
        // Create the pattern based on sequence type
        switch (this.sequenceType) {
            case 'horizontal':
                this.generateHorizontalSequence();
                break;
            case 'vertical':
                this.generateVerticalSequence();
                break;
            case 'diagonal':
                this.generateDiagonalSequence();
                break;
            case 'circular':
                this.generateCircularSequence();
                break;
        }
        
        // Add some noise to the pattern positions based on noise level
        if (this.noiseLevel > 0) {
            this.elements.forEach(element => {
                element.x += p.random(-this.noiseLevel * 10, this.noiseLevel * 10);
                element.y += p.random(-this.noiseLevel * 10, this.noiseLevel * 10);
            });
        }
    }
    
    generateHorizontalSequence() {
        const step = this.elementSize * 2.5;
        
        for (let i = 0; i < this.elementCount; i++) {
            this.elements.push({
                x: this.startX + (i * step),
                y: this.startY,
                size: this.elementSize
            });
        }
    }
    
    generateVerticalSequence() {
        const step = this.elementSize * 2.5;
        
        for (let i = 0; i < this.elementCount; i++) {
            this.elements.push({
                x: this.startX,
                y: this.startY + (i * step),
                size: this.elementSize
            });
        }
    }
    
    generateDiagonalSequence() {
        const step = this.elementSize * 2;
        
        for (let i = 0; i < this.elementCount; i++) {
            this.elements.push({
                x: this.startX + (i * step),
                y: this.startY + (i * step),
                size: this.elementSize
            });
        }
    }
    
    generateCircularSequence() {
        const p = this.p5;
        const radius = this.elementSize * 4;
        const angleStep = (p.TWO_PI) / this.elementCount;
        
        for (let i = 0; i < this.elementCount; i++) {
            const angle = i * angleStep;
            this.elements.push({
                x: this.startX + (Math.cos(angle) * radius),
                y: this.startY + (Math.sin(angle) * radius),
                size: this.elementSize
            });
        }
    }
    
    checkClick(x, y) {
        const p = this.p5;
        const d = p.dist(x, y, this.targetX, this.targetY);
        return d <= this.targetRadius;
    }
    
    draw() {
        const p = this.p5;
        
        // Number of elements to show based on current phase
        let showCount = 0;
        
        if (this.state === 'emergence') {
            // During emergence, gradually reveal elements
            showCount = Math.floor((this.timeElapsed / this.emergeTime) * (this.elementCount - 1));
            
            // Ensure at least one element is shown
            showCount = Math.max(1, showCount);
        } else {
            // In prediction phase or completed, show all but the last element
            showCount = this.elementCount - 1;
        }
        
        // Draw visible elements
        for (let i = 0; i < showCount; i++) {
            const element = this.elements[i];
            
            // Set color based on element state
            if (i === showCount - 1) {
                // Latest element is highlighted
                p.fill(this.highlightColor);
            } else {
                // Previous elements are base color with reduced opacity
                const c = this.baseColor;
                p.fill(p.red(c), p.green(c), p.blue(c), 150);
            }
            
            p.noStroke();
            p.circle(element.x, element.y, element.size);
        }
        
        // Draw the target zone for prediction phase
        if (this.state === 'prediction') {
            p.noFill();
            p.stroke(this.highlightColor);
            p.strokeWeight(2);
            
            // Pulsing effect based on time elapsed
            const pulseRate = 2; // Hz
            const pulseMagnitude = 0.2; // 20% size variation
            const pulsePhase = (this.timeElapsed * pulseRate) % 1;
            const pulseFactor = 1 + pulseMagnitude * Math.sin(pulsePhase * p.TWO_PI);
            
            // Draw dashed circle for prediction area
            const dashCount = 16;
            const dashAngle = p.TWO_PI / dashCount;
            
            for (let i = 0; i < dashCount; i++) {
                if (i % 2 === 0) {
                    const startAngle = i * dashAngle;
                    const endAngle = (i + 1) * dashAngle;
                    p.arc(this.targetX, this.targetY, 
                         this.targetRadius * 2 * pulseFactor, 
                         this.targetRadius * 2 * pulseFactor,
                         startAngle, endAngle);
                }
            }
        }
        
        // If the pattern is completed successfully, draw the final element
        if (this.state === 'completed') {
            const finalElement = this.elements[this.elementCount - 1];
            p.fill(0, 245, 160); // Success color
            p.circle(finalElement.x, finalElement.y, finalElement.size);
        }
        
        // If the pattern failed, show where it should have been
        if (this.state === 'failed') {
            const finalElement = this.elements[this.elementCount - 1];
            p.fill(255, 56, 96); // Failure color
            p.circle(finalElement.x, finalElement.y, finalElement.size);
        }
    }
}

// Geometric Pattern - patterns based on geometric shapes and symmetry
class GeometricPattern extends Pattern {
    constructor(levelConfig) {
        super(levelConfig);
        
        const p = this.p5;
        const w = GAME.width;
        const h = GAME.height;
        
        // Pattern configuration
        this.centerX = p.random(w * 0.3, w * 0.7);
        this.centerY = p.random(h * 0.3, h * 0.7);
        this.shapeType = p.random(['triangle', 'square', 'pentagon', 'hexagon']);
        
        // Size and positioning
        this.baseSize = 30 + (this.complexity * 20); // Size scales with complexity
        this.rotationSpeed = (0.5 + this.speed) * p.PI / 180; // Rotation in radians per frame
        this.rotationOffset = 0;
        
        // Time settings
        this.emergeTime = 2.5 - (this.speed * 1.2); // 1.3 to 2.5 seconds based on speed
        this.predictionTime = 1.8 - (this.speed * 0.8); // 1 to 1.8 seconds based on speed
        
        // Color settings
        this.baseColor = p.color(58, 16, 229); // Primary blue
        this.highlightColor = p.color(0, 240, 255); // Accent cyan
        
        // Pattern properties
        this.points = [];
        this.targetIndex = 0;
        this.generatePoints();
        
        // Target position (where the next element will appear)
        this.targetX = this.points[this.targetIndex].x;
        this.targetY = this.points[this.targetIndex].y;
        
        // Click hit area
        this.targetRadius = 25;
    }
    
    generatePoints() {
        const p = this.p5;
        const sides = this.getShapeSides();
        
        // Generate the base shape points
        for (let i = 0; i < sides; i++) {
            const angle = (p.TWO_PI / sides) * i - p.HALF_PI;
            this.points.push({
                x: this.centerX + Math.cos(angle) * this.baseSize,
                y: this.centerY + Math.sin(angle) * this.baseSize,
                angle: angle,
                active: false
            });
        }
        
        // Set starting active points and choose target
        this.targetIndex = p.floor(p.random(sides));
        
        // Randomly activate some points to start
        for (let i = 0; i < sides; i++) {
            if (i !== this.targetIndex) {
                this.points[i].active = p.random() > 0.3;
            }
        }
    }
    
    getShapeSides() {
        switch (this.shapeType) {
            case 'triangle': return 3;
            case 'square': return 4;
            case 'pentagon': return 5;
            case 'hexagon': return 6;
            default: return 4;
        }
    }
    
    checkClick(x, y) {
        const p = this.p5;
        const d = p.dist(x, y, this.targetX, this.targetY);
        return d <= this.targetRadius;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update the rotation
        this.rotationOffset += this.rotationSpeed;
        
        // Update the point positions
        const p = this.p5;
        const sides = this.getShapeSides();
        
        for (let i = 0; i < sides; i++) {
            const angle = (p.TWO_PI / sides) * i - p.HALF_PI + this.rotationOffset;
            this.points[i].x = this.centerX + Math.cos(angle) * this.baseSize;
            this.points[i].y = this.centerY + Math.sin(angle) * this.baseSize;
            this.points[i].angle = angle;
        }
        
        // Update target position
        this.targetX = this.points[this.targetIndex].x;
        this.targetY = this.points[this.targetIndex].y;
    }
    
    draw() {
        const p = this.p5;
        
        // Draw base shape
        p.noFill();
        p.stroke(this.baseColor);
        p.strokeWeight(1);
        
        p.beginShape();
        for (let i = 0; i < this.points.length; i++) {
            p.vertex(this.points[i].x, this.points[i].y);
        }
        p.endShape(p.CLOSE);
        
        // Draw center point
        p.fill(this.baseColor);
        p.noStroke();
        p.circle(this.centerX, this.centerY, 6);
        
        // Draw active points
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            
            if (point.active) {
                p.fill(this.highlightColor);
                p.noStroke();
                p.circle(point.x, point.y, 12);
            }
        }
        
        // Draw connection lines between active points
        p.stroke(this.baseColor);
        p.strokeWeight(1);
        
        for (let i = 0; i < this.points.length; i++) {
            if (this.points[i].active) {
                for (let j = i + 1; j < this.points.length; j++) {
                    if (this.points[j].active) {
                        p.line(this.points[i].x, this.points[i].y, 
                               this.points[j].x, this.points[j].y);
                    }
                }
            }
        }
        
        // Draw target zone during prediction phase
        if (this.state === 'prediction') {
            p.noFill();
            p.stroke(this.highlightColor);
            p.strokeWeight(2);
            
            // Pulsing effect
            const pulseRate = 2; // Hz
            const pulseMagnitude = 0.2; // 20% size variation
            const pulsePhase = (this.timeElapsed * pulseRate) % 1;
            const pulseFactor = 1 + pulseMagnitude * Math.sin(pulsePhase * p.TWO_PI);
            
            // Draw target indicator
            p.circle(this.targetX, this.targetY, 
                     this.targetRadius * 2 * pulseFactor);
        }
        
        // Show outcome when complete
        if (this.state === 'completed') {
            // Draw the target point in success color
            p.fill(0, 245, 160); // Success color
            p.noStroke();
            p.circle(this.targetX, this.targetY, 15);
            
            // Connect to other active points
            p.stroke(0, 245, 160, 150);
            p.strokeWeight(2);
            
            for (let i = 0; i < this.points.length; i++) {
                if (this.points[i].active && i !== this.targetIndex) {
                    p.line(this.targetX, this.targetY, 
                           this.points[i].x, this.points[i].y);
                }
            }
        }
        
        // Show missed target
        if (this.state === 'failed') {
            p.fill(255, 56, 96); // Failure color
            p.noStroke();
            p.circle(this.targetX, this.targetY, 15);
        }
    }
}

// Convergence Pattern - multiple elements that converge to a single point
class ConvergencePattern extends Pattern {
    constructor(levelConfig) {
        super(levelConfig);
        
        const p = this.p5;
        const w = GAME.width;
        const h = GAME.height;
        
        // Pattern configuration
        this.particles = [];
        this.particleCount = 5 + Math.floor(this.complexity * 5); // More particles with higher complexity
        
        // Target position where particles converge
        this.targetX = p.random(w * 0.2, w * 0.8);
        this.targetY = p.random(h * 0.2, h * 0.8);
        this.targetRadius = 30;
        
        // Time settings
        this.emergeTime = 4 - (this.speed * 2); // 2 to 4 seconds based on speed
        this.predictionTime = 1.5 - (this.speed * 0.5); // 1 to 1.5 seconds based on speed
        
        // Generate particles
        this.generateParticles();
        
        // Color settings
        this.baseColor = p.color(58, 16, 229); // Primary blue
        this.highlightColor = p.color(0, 245, 160); // Success green
    }
    
    generateParticles() {
        const p = this.p5;
        const w = GAME.width;
        const h = GAME.height;
        
        // Create particles from the edges of the screen
        for (let i = 0; i < this.particleCount; i++) {
            // Determine starting position - from edges of screen
            let startX, startY;
            
            const edge = p.floor(p.random(4));
            switch (edge) {
                case 0: // Top
                    startX = p.random(w);
                    startY = 0;
                    break;
                case 1: // Right
                    startX = w;
                    startY = p.random(h);
                    break;
                case 2: // Bottom
                    startX = p.random(w);
                    startY = h;
                    break;
                case 3: // Left
                    startX = 0;
                    startY = p.random(h);
                    break;
            }
            
            // Add some noise to particle trajectory based on level
            const perfectX = this.targetX;
            const perfectY = this.targetY;
            
            // Angle from start to target
            const angle = p.atan2(perfectY - startY, perfectX - startX);
            
            // Add some noise to angle based on noise level
            const noisyAngle = angle + p.random(-this.noiseLevel, this.noiseLevel) * p.PI / 4;
            
            // Distance from start to target
            const dist = p.dist(startX, startY, perfectX, perfectY);
            
            // Calculate speed to arrive at approximately the same time
            const speed = dist / this.emergeTime;
            
            this.particles.push({
                x: startX,
                y: startY,
                size: p.random(4, 8),
                velocityX: p.cos(noisyAngle) * speed,
                velocityY: p.sin(noisyAngle) * speed,
                color: p.color(
                    p.random([58, 131, 246]), 
                    p.random([16, 103, 255]), 
                    p.random([229, 199, 255])
                ),
                opacity: 255,
                active: true
            });
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        const p = this.p5;
        
        // Update particles in emergence phase
        if (this.state === 'emergence') {
            // Move all active particles
            this.particles.forEach(particle => {
                if (particle.active) {
                    particle.x += particle.velocityX * deltaTime;
                    particle.y += particle.velocityY * deltaTime;
                    
                    // Check if particle has reached the target
                    const d = p.dist(particle.x, particle.y, this.targetX, this.targetY);
                    if (d < this.targetRadius / 3) {
                        particle.active = false;
                    }
                }
            });
            
            // Check if all particles have converged
            const activeCount = this.particles.filter(p => p.active).length;
            if (activeCount === 0 && this.timeElapsed < this.emergeTime) {
                // All particles have arrived early, transition to prediction
                this.state = 'prediction';
                this.timeElapsed = 0;
            }
        }
    }
    
    checkClick(x, y) {
        const p = this.p5;
        const d = p.dist(x, y, this.targetX, this.targetY);
        return d <= this.targetRadius;
    }
    
    draw() {
        const p = this.p5;
        
        // Draw particles
        this.particles.forEach(particle => {
            if (particle.active && this.state === 'emergence') {
                p.fill(particle.color);
                p.noStroke();
                p.circle(particle.x, particle.y, particle.size);
                
                // Draw trail
                p.stroke(p.red(particle.color), p.green(particle.color), p.blue(particle.color), 100);
                p.strokeWeight(particle.size / 2);
                
                // Calculate trail start based on velocity (opposite direction)
                const trailLength = 15;
                const trailX = particle.x - (particle.velocityX / trailLength);
                const trailY = particle.y - (particle.velocityY / trailLength);
                
                p.line(particle.x, particle.y, trailX, trailY);
            }
        });
        
        // Show convergence point during prediction phase
        if (this.state === 'prediction') {
            // Draw target circle
            p.noFill();
            p.stroke(this.highlightColor);
            p.strokeWeight(2);
            
            // Pulsing effect
            const pulseRate = 2; // Hz
            const pulseMagnitude = 0.2; // 20% size variation
            const pulsePhase = (this.timeElapsed * pulseRate) % 1;
            const pulseFactor = 1 + pulseMagnitude * Math.sin(pulsePhase * p.TWO_PI);
            
            p.circle(this.targetX, this.targetY, this.targetRadius * 2 * pulseFactor);
            
            // Draw converging lines
            p.stroke(this.baseColor);
            p.strokeWeight(1);
            
            const lineCount = 8;
            const angleStep = p.TWO_PI / lineCount;
            
            for (let i = 0; i < lineCount; i++) {
                const angle = i * angleStep;
                const lineLength = 50 + (Math.sin(pulsePhase * p.TWO_PI) * 10);
                
                const x1 = this.targetX + Math.cos(angle) * lineLength;
                const y1 = this.targetY + Math.sin(angle) * lineLength;
                const x2 = this.targetX + Math.cos(angle) * (lineLength / 2);
                const y2 = this.targetY + Math.sin(angle) * (lineLength / 2);
                
                p.line(x1, y1, x2, y2);
            }
        }
        
        // Show outcome when complete
        if (this.state === 'completed') {
            // Success burst effect
            p.fill(this.highlightColor);
            p.noStroke();
            p.circle(this.targetX, this.targetY, 20);
            
            // Radiating circles
            p.noFill();
            p.stroke(this.highlightColor);
            p.strokeWeight(2);
            
            for (let i = 1; i <= 3; i++) {
                const radius = i * 15;
                p.circle(this.targetX, this.targetY, radius * 2);
            }
        }
        
        // Show missed target
        if (this.state === 'failed') {
            p.fill(255, 56, 96); // Failure color
            p.noStroke();
            p.circle(this.targetX, this.targetY, 20);
            
            // X marker
            p.stroke(255, 56, 96);
            p.strokeWeight(2);
            const offset = 15;
            
            p.line(this.targetX - offset, this.targetY - offset, 
                   this.targetX + offset, this.targetY + offset);
            p.line(this.targetX + offset, this.targetY - offset, 
                   this.targetX - offset, this.targetY + offset);
        }
    }
}