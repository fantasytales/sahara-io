const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load Images
const playerImage = new Image();
playerImage.src = 'assets/player.png';

const itemImage = new Image();
itemImage.src = 'assets/item.png';

// Load Different Enemy Images
const chaserImage = new Image();
chaserImage.src = 'assets/chaser.png';

const evaderImage = new Image();
evaderImage.src = 'assets/evader.png';

const randomImage = new Image();
randomImage.src = 'assets/random.png';

// Enemy Types
const enemyTypes = [
    { type: 'chaser', image: chaserImage },
    { type: 'evader', image: evaderImage },
    { type: 'random', image: randomImage }
];

// Game Variables
let gameActive = false;
let showingInstructions = false;
let player = { x: 0, y: 0, size: 10, targetSize: 10, speed: 2, direction: { x: 0, y: 0 } };
let items = [];
let enemies = [];

// Scoring System
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

// Game Boundary
const gameBoundary = { width: 2000, height: 2000 };

// Configurations
const maxPlayerSize = 150;
const maxItems = 20;
const maxEnemies = 10;
const growthRate = 0.1; 
const enemyBaseSpeed = 0.5; // Base speed for enemies

// Load Audio
const backgroundMusic = new Audio('assets/background.wav');
const collectSound = new Audio('assets/collect.wav');
const collisionSound = new Audio('assets/collision.wav');

// Load Mute Button
const muteButton = document.getElementById('muteButton');
let isMuted = false;

muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    backgroundMusic.muted = isMuted;
    collectSound.muted = isMuted;
    collisionSound.muted = isMuted;
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
});

// Load Others Button
const startScreen = document.getElementById('startScreen');
const howToPlayScreen = document.getElementById('howToPlayScreen');
const startButton = document.getElementById('startButton');
const howToPlayButton = document.getElementById('howToPlayButton');
const backButton = document.getElementById('backButton');

// Mouse Input
window.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
    player.direction.x = Math.cos(angle);
    player.direction.y = Math.sin(angle);
});

// Start Game
function startGame() {
    // Hide buttons when the game starts
    startScreen.classList.remove('hidden');
    howToPlayScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
    howToPlayScreen.classList.add('hidden');

    restartButton.style.display = 'none';

    // Reset game state
    player = { x: 0, y: 0, size: 10, targetSize: 10, speed: 2, direction: { x: 0, y: 0 } };
    items = generateItems(maxItems);
    enemies = generateEnemies(maxEnemies);
    score = 0;
    gameActive = true;
    showingInstructions = false;

    // Start background music
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.03;
    backgroundMusic.play();

    // Start the game loop
    gameLoop();
}

// Play Sound Effects
function playCollectSound() {
    collectSound.currentTime = 0; // Rewind to start
    collectSound.play();
}

function playCollisionSound() {
    collisionSound.currentTime = 0;
    collisionSound.play();
}

// Generate Items and Enemies
function generateItems(count) {
    return Array.from({ length: count }, () => ({
        x: Math.random() * gameBoundary.width - gameBoundary.width / 2,
        y: Math.random() * gameBoundary.height - gameBoundary.height / 2,
        size: 10
    }));
}

function generateEnemies(count) {
    return Array.from({ length: count }, () => {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        return {
            x: Math.random() * gameBoundary.width - gameBoundary.width / 2,
            y: Math.random() * gameBoundary.height - gameBoundary.height / 2,
            size: 20 + Math.random() * 30,
            speed: enemyBaseSpeed + score * 0.001,
            direction: { x: Math.random() - 0.5, y: Math.random() - 0.5 },
            type: enemyType.type,
            image: enemyType.image
        };
    });
}

// Collision Detection
function isColliding(obj1, obj2) {
    return !(
        obj1.x + obj1.size < obj2.x || // Right side of obj1 is left of obj2
        obj1.x - obj1.size > obj2.x + obj2.size || // Left side of obj1 is right of obj2
        obj1.y + obj1.size < obj2.y || // Bottom of obj1 is above obj2
        obj1.y - obj1.size > obj2.y + obj2.size // Top of obj1 is below obj2
    );
}

let bgOffsetX = 0;
let bgOffsetY = 0;
// Draw Gradient Background
function drawBackground() {
    bgOffsetX = player.x * 0.1; // Move slower than player
    bgOffsetY = player.y * 0.1;
    ctx.save();
    ctx.translate(-bgOffsetX, -bgOffsetY);
    ctx.fillStyle = '#87CEEB'; // Sky blue as a fallback color
    ctx.fillRect(0, 0, canvas.width * 2, canvas.height * 2); // Cover the canvas area
    ctx.restore();
}

// Draw Game Boundary
function drawGameBoundary() {
    ctx.strokeStyle = 'yellow'; 
    ctx.lineWidth = 5; 
    ctx.setLineDash([10, 5]); 
    ctx.strokeRect(
        canvas.width / 2 - gameBoundary.width / 2 - player.x,
        canvas.height / 2 - gameBoundary.height / 2 - player.y,
        gameBoundary.width,
        gameBoundary.height
    );
    ctx.setLineDash([]);
}

// Draw Score on Screen
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`High Score: ${highScore}`, 20, 60);
}

// Main Game Loop
function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawGameBoundary();

    player.x += player.direction.x * player.speed;
    player.y += player.direction.y * player.speed;

    player.size += (player.targetSize - player.size) * growthRate;

    if (
        player.x - player.size < -gameBoundary.width / 2 ||
        player.x + player.size > gameBoundary.width / 2 ||
        player.y - player.size < -gameBoundary.height / 2 ||
        player.y + player.size > gameBoundary.height / 2
    ) {
        playCollisionSound();
        endGame();
        return;
    }

    const playerScreenX = canvas.width / 2 - player.size;
    const playerScreenY = canvas.height / 2 - player.size;
    ctx.drawImage(playerImage, playerScreenX, playerScreenY, player.size * 2, player.size * 2);

    if (items.length < maxItems) {
        items = items.concat(generateItems(maxItems - items.length));
    }
    if (enemies.length < maxEnemies) {
        enemies = enemies.concat(generateEnemies(maxEnemies - enemies.length));
    }

    items = items.filter(item => {
        const screenX = item.x - player.x + canvas.width / 2 - item.size;
        const screenY = item.y - player.y + canvas.height / 2 - item.size;

        if (isColliding({ x: canvas.width / 2, y: canvas.height / 2, size: player.size }, { x: screenX, y: screenY, size: item.size })) {
            player.targetSize = Math.min(maxPlayerSize, player.targetSize + 1);
            score += 10;
            playCollectSound();
            return false;
        }

        ctx.drawImage(itemImage, screenX, screenY, item.size * 2, item.size * 2);
        return true;
    });

    enemies = enemies.filter(enemy => {
        const speedMultiplier = 1 + score / 300;
        const screenX = enemy.x - player.x + canvas.width / 2 - enemy.size;
        const screenY = enemy.y - player.y + canvas.height / 2 - enemy.size;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        switch (enemy.type) {
            case 'chaser':
                enemy.direction.x = dx / distance;
                enemy.direction.y = dy / distance;
                break;
            case 'evader':
                enemy.direction.x = -dx / distance;
                enemy.direction.y = -dy / distance;
                break;
            case 'random':
                if (Math.random() < 0.01) {
                    enemy.direction.x = Math.random() - 0.5;
                    enemy.direction.y = Math.random() - 0.5;
                }
                break;
        }

        enemy.x += enemy.direction.x * enemy.speed * speedMultiplier;
        enemy.y += enemy.direction.y * enemy.speed * speedMultiplier;

        // Randomize enemy position if out of boundary
        if (
            enemy.x < -gameBoundary.width / 2 - enemy.size ||
            enemy.x > gameBoundary.width / 2 + enemy.size ||
            enemy.y < -gameBoundary.height / 2 - enemy.size ||
            enemy.y > gameBoundary.height / 2 + enemy.size
        ) {
            // Randomly reposition enemy within the boundary
            enemy.x = Math.random() * gameBoundary.width - gameBoundary.width / 2;
            enemy.y = Math.random() * gameBoundary.height - gameBoundary.height / 2;

            // Update direction to avoid getting stuck again
            enemy.direction.x = Math.random() - 0.5;
            enemy.direction.y = Math.random() - 0.5;
        }

        if (isColliding({ x: canvas.width / 2, y: canvas.height / 2, size: player.size }, { x: screenX, y: screenY, size: enemy.size })) {
            if (player.size > enemy.size) {
                player.targetSize = Math.min(maxPlayerSize, player.targetSize + 2);
                score += 50;
                return false;
            } else {
                playCollisionSound();
                endGame();
                return false;
            }
        }

        ctx.drawImage(enemy.image, screenX, screenY, enemy.size * 2, enemy.size * 2);
        return true;
    });

    drawScore();

    requestAnimationFrame(gameLoop);
}

// End Game
function endGame() {
    gameActive = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    showGameOverScreen();
}

// Show Start Screen
function showStartScreen() {
    startScreen.classList.remove('hidden');
    howToPlayScreen.classList.add('hidden');
    restartButton.style.display = 'none';
}

// Show Instructions Screen
function showInstructions() {
    startScreen.classList.add('hidden');
    howToPlayScreen.classList.remove('hidden');
}

const restartButton = document.getElementById('restartButton');
// Show Game Over Screen
function showGameOverScreen() {
    ctx.fillStyle = 'rgba(255, 100, 100, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 150, canvas.height / 2 - 50);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 150, canvas.height / 2);
    restartButton.style.top = '60%';
    restartButton.style.display = 'block';
}

// Event Listeners for Buttons
startButton.addEventListener('click', startGame);
howToPlayButton.addEventListener('click', showInstructions);
backButton.addEventListener('click', showStartScreen);
restartButton.addEventListener('click', startGame);

// Mobile Touch Input
canvas.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const angle = Math.atan2(touch.clientY - canvas.height / 2, touch.clientX - canvas.width / 2);
    player.direction.x = Math.cos(angle);
    player.direction.y = Math.sin(angle);
}, { passive: false });

// Ensure Canvas Resizes Correctly
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

playerImage.onload = () => {
    itemImage.onload = () => {
        enemyTypes.onload = () => {
            showStartScreen();
        };
    };
};

showStartScreen();
