// Game state
let gameState = {
    totalPoints: 0,
    badges: {
        connector: false,
        charts: false,
        design: false,
        filters: false,
        hero: false
    },
    moduleProgress: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    },
    completedSteps: new Set()
};

// Load saved progress
function loadProgress() {
    const saved = localStorage.getItem('powerbi-game-progress');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
        updateUI();
        restoreCompletedSteps();
    }
}

// Save progress
function saveProgress() {
    localStorage.setItem('powerbi-game-progress', JSON.stringify(gameState));
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    setupEventListeners();
    updateUI();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const moduleId = this.getAttribute('data-module');
            showModule(moduleId);
            
            // Update active nav
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Complete buttons
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const step = this.closest('.step');
            const stepNumber = step.getAttribute('data-step');
            const moduleNumber = step.getAttribute('data-module');
            
            completeStep(stepNumber, moduleNumber, step);
        });
    });
}

// Show module
function showModule(moduleId) {
    document.querySelectorAll('.module-content').forEach(module => {
        module.classList.remove('active');
    });
    
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.classList.add('active');
    }
}

// Complete step
function completeStep(stepNumber, moduleNumber, stepElement) {
    const stepId = `${moduleNumber}-${stepNumber}`;
    
    if (gameState.completedSteps.has(stepId)) {
        return; // Already completed
    }
    
    // Mark as completed
    gameState.completedSteps.add(stepId);
    stepElement.classList.add('completed');
    
    // Add points
    let points = getStepPoints(moduleNumber, stepNumber);
    gameState.totalPoints += points;
    
    // Update module progress
    gameState.moduleProgress[moduleNumber]++;
    
    // Check for badges
    checkBadges(moduleNumber);
    
    // Show celebration if needed
    showStepCelebration(stepElement, points);
    
    // Update UI
    updateUI();
    saveProgress();
}

// Get points for step
function getStepPoints(moduleNumber, stepNumber) {
    const pointsMap = {
        1: 25, // Data connection steps
        2: 50, // Visualization steps
        3: 25, // Design steps
        4: 75, // Filter steps
        5: 50  // Publishing steps
    };
    return pointsMap[moduleNumber] || 25;
}

// Check badges
function checkBadges(moduleNumber) {
    const moduleSteps = {
        1: 4, // Data connection
        2: 5, // Visualizations
        3: 4, // Design
        4: 3, // Filters
        5: 2  // Publishing
    };
    
    if (gameState.moduleProgress[moduleNumber] >= moduleSteps[moduleNumber]) {
        const badgeMap = {
            1: 'connector',
            2: 'charts',
            3: 'design',
            4: 'filters',
            5: 'hero'
        };
        
        const badgeKey = badgeMap[moduleNumber];
        if (!gameState.badges[badgeKey]) {
            gameState.badges[badgeKey] = true;
            unlockBadge(badgeKey);
        }
    }
}

// Unlock badge
function unlockBadge(badgeKey) {
    const badge = document.getElementById(`badge-${badgeKey}`);
    if (badge) {
        badge.classList.remove('locked');
        badge.classList.add('unlocked');
        
        // Show badge notification
        showBadgeNotification(badgeKey);
    }
}

// Show badge notification
function showBadgeNotification(badgeKey) {
    const badgeNames = {
        connector: 'Data Connector',
        charts: 'Chart Master',
        design: 'Design Guru',
        filters: 'Filter Expert',
        hero: 'Dashboard Hero'
    };
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>🏆 Badge Unlocked!</h3>
            <p>You earned the <strong>${badgeNames[badgeKey]}</strong> badge!</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Check if all badges unlocked
    if (Object.values(gameState.badges).every(badge => badge === true)) {
        setTimeout(() => showFinalCelebration(), 1000);
    }
}

// Show step celebration
function showStepCelebration(stepElement, points) {
    // Find success message in step
    const successMsg = stepElement.querySelector('.success-message');
    if (successMsg) {
        successMsg.style.display = 'block';
    }
    
    // Show points animation
    const pointsElement = document.createElement('div');
    pointsElement.className = 'points-popup';
    pointsElement.textContent = `+${points} points!`;
    stepElement.appendChild(pointsElement);
    
    setTimeout(() => {
        pointsElement.remove();
    }, 2000);
}

// Show final celebration
function showFinalCelebration() {
    const celebration = document.querySelector('.celebration-trigger');
    if (celebration) {
        celebration.style.display = 'block';
    }
    
    // Confetti effect
    createConfetti();
}

// Create confetti effect
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][Math.floor(Math.random() * 5)];
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 100);
    }
}

// Update UI
function updateUI() {
    // Update points
    document.getElementById('total-points').textContent = gameState.totalPoints;
    
    // Update badges count
    const unlockedBadges = Object.values(gameState.badges).filter(badge => badge === true).length;
    document.getElementById('badges-count').textContent = unlockedBadges;
    
    // Update overall progress
    const totalSteps = 18; // Total steps across all modules
    const completedSteps = gameState.completedSteps.size;
    const overallProgress = (completedSteps / totalSteps) * 100;
    document.getElementById('overall-progress').style.width = overallProgress + '%';
    
    // Update module progress
    updateModuleProgress();
    
    // Update badges
    Object.keys(gameState.badges).forEach(badgeKey => {
        if (gameState.badges[badgeKey]) {
            unlockBadge(badgeKey);
        }
    });
}

// Update module progress
function updateModuleProgress() {
    const moduleSteps = { 1: 4, 2: 5, 3: 4, 4: 3, 5: 2 };
    
    Object.keys(moduleSteps).forEach(moduleNum => {
        const progress = (gameState.moduleProgress[moduleNum] / moduleSteps[moduleNum]) * 100;
        const progressBar = document.getElementById(`module${moduleNum}-progress`);
        const statusText = document.getElementById(`module${moduleNum}-status`);
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (statusText) {
            statusText.textContent = `${gameState.moduleProgress[moduleNum]}/${moduleSteps[moduleNum]} Steps Complete`;
        }
    });
}

// Restore completed steps
function restoreCompletedSteps() {
    gameState.completedSteps.forEach(stepId => {
        const [moduleNum, stepNum] = stepId.split('-');
        const stepElement = document.querySelector(`[data-module="${moduleNum}"][data-step="${stepNum}"]`);
        if (stepElement) {
            stepElement.classList.add('completed');
        }
    });
}

// CSS for animations (add to head)
const style = document.createElement('style');
style.textContent = `
    .badge-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideInRight 0.5s ease;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .points-popup {
        position: absolute;
        top: -30px;
        right: 10px;
        background: #27ae60;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        animation: pointsAnimation 2s ease;
        z-index: 100;
    }
    
    @keyframes pointsAnimation {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
    }
    
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        top: -10px;
        z-index: 1000;
        animation: confettiDrop 3s linear forwards;
    }
    
    @keyframes confettiDrop {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    .step.completed {
        border-color: #27ae60;
        background: #f8fff9;
    }
    
    .step.completed .step-header {
        background: #d4edda;
    }
    
    .step.completed .step-number {
        background: #27ae60;
    }
    
    .step.completed .complete-btn {
        background: #27ae60;
    }
    
    .step.completed .complete-btn:after {
        content: " ✓";
    }
    
    .final-celebration {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        margin: 2rem 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: celebrationPulse 2s infinite;
    }
    
    @keyframes celebrationPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .final-stats {
        background: rgba(255,255,255,0.1);
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0;
    }
`;
document.head.appendChild(style);
// Add this to your setupEventListeners function
function setupEventListeners() {
    // ... existing code ...

    // Reset game button
    document.getElementById('reset-game-btn').addEventListener('click', showResetConfirmation);
}

// Show reset confirmation
function showResetConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'reset-modal';
    modal.innerHTML = `
        <div class="reset-modal-content">
            <h3>🔄 Reset Your Progress?</h3>
            <p>Are you sure you want to reset all your progress?</p>
            <p><strong>This will:</strong></p>
            <ul style="text-align: left; margin: 1rem 0;">
                <li>Reset all points to 0</li>
                <li>Remove all badges</li>
                <li>Mark all steps as incomplete</li>
                <li>Start fresh from the beginning</li>
            </ul>
            <p><em>This action cannot be undone!</em></p>
            <div class="reset-modal-buttons">
                <button class="confirm-reset">Yes, Reset Everything</button>
                <button class="cancel-reset">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners for modal buttons
    modal.querySelector('.confirm-reset').addEventListener('click', () => {
        resetGame();
        modal.remove();
    });
    
    modal.querySelector('.cancel-reset').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Reset game function
function resetGame() {
    // Reset game state
    gameState = {
        totalPoints: 0,
        badges: {
            connector: false,
            charts: false,
            design: false,
            filters: false,
            hero: false
        },
        moduleProgress: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        },
        completedSteps: new Set()
    };
    
    // Clear localStorage
    localStorage.removeItem('powerbi-game-progress');
    
    // Reset UI
    resetUI();
    
    // Show reset confirmation
    showResetSuccess();
    
    // Go back to overview
    showModule('overview');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-module="overview"]').classList.add('active');
}

// Reset UI elements
function resetUI() {
    // Reset all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('completed');
    });
    
    // Reset all badges
    document.querySelectorAll('.badge').forEach(badge => {
        badge.classList.remove('unlocked');
        badge.classList.add('locked');
    });
    
    // Hide success messages
    document.querySelectorAll('.success-message, .celebration-trigger').forEach(element => {
        element.style.display = 'none';
    });
    
    // Update counters
    updateUI();
}

// Show reset success message
function showResetSuccess() {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>🎮 Game Reset Successfully!</h3>
            <p>Your Power BI quest starts fresh. Good luck!</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
