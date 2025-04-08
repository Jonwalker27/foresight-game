// UI Controller - Manages UI elements and interactions
const UI = {
    // DOM Elements
    elements: {
        score: document.getElementById('score'),
        level: document.getElementById('level'),
        time: document.getElementById('time'),
        startBtn: document.getElementById('start-btn'),
        tutorialBtn: document.getElementById('tutorial-btn'),
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        modalBtn: document.getElementById('modal-btn'),
        closeBtn: document.querySelector('.close-btn')
    },
    
    // Initialize UI
    init() {
        // Set up event listeners
        this.elements.startBtn.addEventListener('click', () => {
            if (GAME.state === 'MENU' || GAME.state === 'GAMEOVER') {
                GAME.startGame();
            }
        });
        
        this.elements.tutorialBtn.addEventListener('click', () => {
            this.showModal('tutorial');
        });
        
        this.elements.modalBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        this.elements.closeBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        // Initialize UI values
        this.updateScore(0);
        this.updateLevel(1);
        this.updateTime(60);
    },
    
    // Update score display
    updateScore(score) {
        this.elements.score.textContent = score;
        
        // Add a pulse animation when score changes
        this.elements.score.classList.add('pulse');
        setTimeout(() => {
            this.elements.score.classList.remove('pulse');
        }, 500);
    },
    
    // Update level display
    updateLevel(level) {
        this.elements.level.textContent = level;
        
        // Add a pulse animation when level changes
        this.elements.level.classList.add('pulse');
        setTimeout(() => {
            this.elements.level.classList.remove('pulse');
        }, 500);
    },
    
    // Update time display
    updateTime(time) {
        this.elements.time.textContent = time;
        
        // Add warning color when time is low
        if (time <= 10) {
            this.elements.time.style.color = 'var(--error-color)';
        } else {
            this.elements.time.style.color = '';
        }
    },
    
    // Show modal with specific content
    showModal(type) {
        switch (type) {
            case 'welcome':
                this.elements.modalTitle.textContent = 'Welcome to FORESIGHT';
                this.elements.modalBody.innerHTML = `
                    <p>Train your dimensional intelligence - the ability to see patterns others miss and anticipate what's coming before it emerges.</p>
                    
                    <h3>How to Play:</h3>
                    <ol>
                        <li><strong>Pattern Anticipation:</strong> Predict where patterns will emerge before they fully appear.</li>
                        <li><strong>Signal Detection:</strong> Focus on meaningful signals while filtering out noise.</li>
                        <li><strong>Multi-Tracking:</strong> Monitor multiple evolving patterns simultaneously.</li>
                    </ol>
                    
                    <p>As you progress, the challenges will become more complex - testing and strengthening your dimensional intelligence.</p>
                    
                    <p><em>"The ability to recognize patterns before others is what separates exceptional performers from the merely good."</em></p>
                `;
                this.elements.modalBtn.textContent = 'Start Training';
                break;
                
            case 'tutorial':
                this.elements.modalTitle.textContent = 'How to Play';
                this.elements.modalBody.innerHTML = `
                    <h3>Pattern Recognition:</h3>
                    <p>Patterns will begin to emerge on screen. Watch carefully to identify the underlying logic.</p>
                    
                    <h3>Prediction Phase:</h3>
                    <p>Before a pattern completes, you'll enter the prediction phase indicated by a pulsing indicator. Click where you believe the pattern will complete.</p>
                    
                    <h3>Scoring:</h3>
                    <p>Correct predictions earn points based on:</p>
                    <ul>
                        <li>Base points for each pattern type</li>
                        <li>Time bonus for quick predictions</li>
                        <li>Complexity multiplier for more difficult patterns</li>
                    </ul>
                    
                    <h3>Advancing Levels:</h3>
                    <p>Each level has a target score. Reach it to advance to a more challenging level with:</p>
                    <ul>
                        <li>More complex patterns</li>
                        <li>Faster evolution</li>
                        <li>Multiple simultaneous patterns</li>
                        <li>Increased noise and distractions</li>
                    </ul>
                    
                    <h3>Pattern Types:</h3>
                    <ul>
                        <li><strong>Sequence Patterns:</strong> Predictable sequences of elements</li>
                        <li><strong>Geometric Patterns:</strong> Based on geometric shapes and symmetry</li>
                        <li><strong>Convergence Patterns:</strong> Multiple elements converging to a point</li>
                    </ul>
                `;
                this.elements.modalBtn.textContent = 'Got It';
                break;
                
            case 'level-up':
                const levelInfo = LEVELS.getLevelDescription(GAME.level);
                this.elements.modalTitle.textContent = `Level ${GAME.level}: ${levelInfo.name}`;
                this.elements.modalBody.innerHTML = `
                    <p>${levelInfo.description}</p>
                    
                    <h3>Level Goals:</h3>
                    <ul>
                        <li>Target Score: ${levelInfo.targetScore}</li>
                        <li>Simultaneous Patterns: ${levelInfo.patternCount}</li>
                    </ul>
                    
                    <p>Complete this level to further develop your dimensional intelligence.</p>
                `;
                this.elements.modalBtn.textContent = 'Continue';
                break;
                
            case 'game-over':
                const rating = LEVELS.getRating(GAME.score, GAME.level);
                this.elements.modalTitle.textContent = 'Training Complete';
                this.elements.modalBody.innerHTML = `
                    <h3>Your Results:</h3>
                    <p>Final Score: <strong>${GAME.score}</strong></p>
                    <p>Level Reached: <strong>${GAME.level}</strong></p>
                    
                    <h3>Performance Rating: ${rating.rating}</h3>
                    <p>${rating.description}</p>
                    
                    <h3>Dimensional Intelligence Components:</h3>
                    <ul>
                        <li><strong>Pattern Recognition:</strong> Your ability to identify underlying patterns</li>
                        <li><strong>Predictive Processing:</strong> Your ability to anticipate based on partial information</li>
                        <li><strong>Multi-Dimensional Thinking:</strong> Your ability to track multiple variables simultaneously</li>
                    </ul>
                    
                    <p>Regular training strengthens these abilities - exceptional performers in fields from sports to business demonstrate enhanced dimensional intelligence.</p>
                `;
                this.elements.modalBtn.textContent = 'Train Again';
                break;
        }
        
        // Show the modal
        this.elements.modal.style.display = 'block';
    },
    
    // Hide modal
    hideModal() {
        this.elements.modal.style.display = 'none';
    },
    
    // Show level notification
    showLevelNotification(level) {
        this.showModal('level-up');
    },
    
    // Show game over modal
    showGameOverModal(score, level) {
        this.showModal('game-over');
    }
};

// Initialize UI when page is loaded
window.addEventListener('load', () => UI.init());