// ------------------- DOM ELEMENTS -------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const homeScreen = document.getElementById('homeScreen');
const startBtn = document.getElementById('startBtn');
const scoreDisplay = document.getElementById('score');
const gameOverBox = document.getElementById('gameOverBox');
const finalScoreText = document.getElementById('finalScore');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const homeBtn = document.getElementById('homeBtn');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicToggleBtnGame = document.getElementById('musicToggleBtnGame');
const continueBtn = document.getElementById('continueBtn');
const homeSettingsMenu = document.getElementById('homeSettingsMenu');
const resetHighScoreBtn = document.getElementById('resetHighScoreBtn');
const closeHomeSettingsBtn = document.getElementById('closeHomeSettingsBtn');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const volumeBtn = document.getElementById('volumeBtn');
const volumeControl = document.getElementById('volumeControl');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

// ------------------- VARIABLES -------------------
let frame = 0;
let laneOffsetY = 0;
let isPaused = false;
let highScore = localStorage.getItem('retroHighScore') || 0;
highScoreDisplay.textContent = 'High Score: ' + highScore;

const lanes = [70, 150, 230, 310, 390, 470];
let previousPlayerLaneIndex;
let playerStayedSameLaneCount = 0;
let smallGroupCounter = 0;
let gameStarted = false;
let gameOver = false;
let loopStarted = false;
let playerLaneHistory = [];

const bgMusic = document.getElementById('bgMusic');
const tracks = [
    'audio/Audioinsmusic - Basscape.mp3',
    'audio/Audioinsmusic - Driftline.mp3',
    'audio/Audioinsmusic - Groovoid.mp3'
];

// ------------------- MUSIC CONTROL -------------------
function initializeMusicState() {
    const savedVolume = parseFloat(localStorage.getItem('retroMusicVolume')) || 0.5;
    bgMusic.volume = savedVolume;
    volumeSlider.value = savedVolume * 100;
    volumeValue.textContent = `${Math.round(savedVolume * 100)}%`;

    let trackIndex = parseInt(localStorage.getItem('retroMusicTrackIndex')) || Math.floor(Math.random() * tracks.length);
    if (trackIndex < 0 || trackIndex >= tracks.length) {
        trackIndex = Math.floor(Math.random() * tracks.length);
    }
    bgMusic.src = tracks[trackIndex];
    localStorage.setItem('retroMusicTrackIndex', trackIndex);

    const savedTime = parseFloat(localStorage.getItem('retroMusicTime')) || 0;
    bgMusic.currentTime = savedTime;

    if (!localStorage.getItem('retroMusicPaused')) {
        localStorage.setItem('retroMusicPaused', 'false');
    }

    const isPaused = localStorage.getItem('retroMusicPaused') === 'true';
    if (isPaused) {
        bgMusic.pause();
    } else {
        bgMusic.play().catch(e => {
            console.log('Autoplay prevented, waiting for user interaction');
            localStorage.setItem('retroMusicPaused', 'true');
        });
    }
    updateMusicButtons();
}

bgMusic.addEventListener('timeupdate', () => {
    localStorage.setItem('retroMusicTime', bgMusic.currentTime);
});

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log('Music play failed:', e));
        localStorage.setItem('retroMusicPaused', 'false');
    } else {
        bgMusic.pause();
        localStorage.setItem('retroMusicPaused', 'true');
        localStorage.setItem('retroMusicTime', bgMusic.currentTime);
    }
    updateMusicButtons();
}

function updateMusicButtons() {
    const label = bgMusic.paused ? 'Play Music' : 'Pause Music';
    musicToggleBtn.textContent = label;
    musicToggleBtnGame.textContent = label;
}

function toggleVolumeControl() {
    volumeControl.style.display = volumeControl.style.display === 'block' ? 'none' : 'block';
}

volumeBtn.addEventListener('click', toggleVolumeControl);

volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value / 100;
    bgMusic.volume = volume;
    localStorage.setItem('retroMusicVolume', volume);
    volumeValue.textContent = `${volumeSlider.value}%`;
});

bgMusic.addEventListener('ended', () => {
    if (localStorage.getItem('retroMusicPaused') !== 'true') {
        const newTrackIndex = Math.floor(Math.random() * tracks.length);
        bgMusic.src = tracks[newTrackIndex];
        localStorage.setItem('retroMusicTrackIndex', newTrackIndex);
        localStorage.setItem('retroMusicTime', 0);
        bgMusic.play().catch(e => console.log('Music play failed:', e));
    }
});

[musicToggleBtn, musicToggleBtnGame].forEach(btn => {
    btn.addEventListener('click', toggleMusic);
});

initializeMusicState();

// ------------------- GAME START / RESET -------------------
startBtn.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    canvas.style.display = 'block';
    scoreDisplay.style.display = 'block';
    settingsBtn.style.display = 'block';
    volumeBtn.style.display = 'block';
    gameStarted = true;
    isPaused = false;

    if (!loopStarted) {
        loopStarted = true;
        loop();
    }

    if (localStorage.getItem('retroMusicPaused') !== 'true') {
        bgMusic.play().catch(e => console.log('Music play failed:', e));
    }
    updateMusicButtons();
    volumeControl.style.display = 'none';
});

function resetGame() {
    frame = 0;
    laneOffsetY = 0;
    enemies.length = 0;
    sideObjects.length = 0;
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    playerStayedSameLaneCount = 0;
    smallGroupCounter = 0;
    previousPlayerLaneIndex = undefined;
    playerLaneHistory = [];
    gameOver = false;
    player.x = lanes[2] - player.width / 2;
    playerTargetX = player.x;
    gameOverBox.style.display = 'none';
    gameStarted = true;
    isPaused = false;

    if (localStorage.getItem('retroMusicPaused') !== 'true') {
        bgMusic.play().catch(e => console.log('Music play failed:', e));
    }
    updateMusicButtons();
    volumeControl.style.display = 'none';
}

restartBtn.addEventListener('click', resetGame);

// ------------------- GAME OVER -------------------
function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    updateMusicButtons();
    volumeControl.style.display = 'none';

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('retroHighScore', highScore);
        highScoreDisplay.textContent = 'High Score: ' + highScore;
    }
    finalScoreText.textContent = 'Your Score: ' + score;
    gameOverBox.style.display = 'block';
}

// ------------------- SETTINGS / HOME -------------------
settingsBtn.addEventListener('click', () => {
    if (!gameStarted) {
        homeSettingsMenu.style.display = homeSettingsMenu.style.display === 'block' ? 'none' : 'block';
    } else if (gameOver) {
        gameOverBox.style.display = 'none';
        settingsMenu.style.display = 'block';
    } else {
        isPaused = true;
        settingsMenu.style.display = 'block';
    }
    volumeControl.style.display = 'none';
});

continueBtn.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    if (gameOver) {
        gameOverBox.style.display = 'block';
    } else {
        isPaused = false;
        if (localStorage.getItem('retroMusicPaused') === 'false') {
            bgMusic.play().catch(e => console.log('Music play failed:', e));
        }
    }
    volumeControl.style.display = 'none';
});

homeBtn.addEventListener('click', () => {
    isPaused = false;
    settingsMenu.style.display = 'none';
    homeSettingsMenu.style.display = 'none';
    gameOverBox.style.display = 'none';
    gameStarted = false;
    canvas.style.display = 'none';
    scoreDisplay.style.display = 'none';
    volumeBtn.style.display = 'none';
    homeScreen.style.display = 'block';
    settingsBtn.style.display = 'block';

    if (localStorage.getItem('retroMusicPaused') !== 'true') {
        bgMusic.play().catch(e => console.log('Music play failed:', e));
    }
    updateMusicButtons();
    volumeControl.style.display = 'none';
});

closeHomeSettingsBtn.addEventListener('click', () => {
    homeSettingsMenu.style.display = 'none';
    volumeControl.style.display = 'none';
});

resetHighScoreBtn.addEventListener('click', () => {
    localStorage.removeItem('retroHighScore');
    highScore = 0;
    highScoreDisplay.textContent = 'High Score: 0';
    homeSettingsMenu.style.display = 'none';
    volumeControl.style.display = 'none';
});

// ------------------- GAME LOGIC -------------------
const trafficCars = ['barrier.png', 'box.png', 'cone.png', 'car.png', 'car2.png', 'car3.png', 'truck2.png', 'truck3.png', 'truck4.png', 'truck5.png'];

const scaleMap = {
    'player': { width: 40, height: 70 },
    'car.png': { width: 40, height: 70 },
    'car2.png': { width: 40, height: 70 },
    'car3.png': { width: 40, height: 70 },
    'barrier.png': { width: 40, height: 23 },
    'box.png': { width: 20, height: 35 },
    'cone.png': { width: 20, height: 35 },
    'truck2.png': { width: 40, height: 98 },
    'truck3.png': { width: 40, height: 98 },
    'truck4.png': { width: 40, height: 98 },
    'truck5.png': { width: 40, height: 133 }
};

const trafficImages = {};
trafficCars.forEach(name => {
    const img = new Image();
    img.src = `images/traffic_images/${name}`;
    trafficImages[name] = img;
});

const playerImg = new Image();
playerImg.src = 'images/player_images/player.png';
const player = {
    x: lanes[2] - 20,
    y: 500,
    width: scaleMap['player'].width,
    height: scaleMap['player'].height,
    speed: 5
};
let playerTargetX = lanes[2] - player.width / 2;
const enemies = [];
const sideObjects = [];
let score = 0;

const allPatterns = [];
for (let i = 1; i < 64; i++) {
    const pattern = [];
    for (let j = 0; j < 6; j++) {
        if (i & (1 << j)) pattern.push(lanes[j]);
    }
    allPatterns.push(pattern);
}

const mirroredPatterns = allPatterns.map(pattern => pattern.map(lane => lanes[lanes.length - 1 - lanes.indexOf(lane)]));
const rotatedPatterns = allPatterns.map(pattern => pattern.map(lane => lanes[(lanes.indexOf(lane) + 3) % 6]));
allPatterns.push(...mirroredPatterns, ...rotatedPatterns);

shuffleArray(allPatterns);

function checkCollision() {
    if (gameOver) return;
    for (const enemy of enemies) {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x && player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            triggerGameOver();
            return;
        }
    }
}

function drawSidewalk() {
    ctx.fillStyle = '#d2b48c';
    ctx.fillRect(0, 0, 30, canvas.height);
    ctx.fillRect(canvas.width - 30, 0, 30, canvas.height);
}

function drawRoad() {
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 0, canvas.width - 60, canvas.height);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -laneOffsetY;
    [110, 190, 270, 350, 430].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    });
    ctx.setLineDash([]);
}

function spawnSideObject() {
    const leftItems = ['tree.png', 'light_l.png'];
    const rightItems = ['tree-pine.png', 'light_r.png'];
    const useLeft = Math.random() > 0.5;
    const selected = (useLeft ? leftItems : rightItems)[Math.floor(Math.random() * 2)];
    sideObjects.push({
        x: selected.includes('light_r') || selected.includes('pine') ? canvas.width - 30 : 0,
        y: -100,
        img: `images/sidewalk_images/${selected}`,
        width: 30,
        height: 50
    });
}

function drawSideObjects() {
    if (frame % 150 === 0) spawnSideObject();
    const speedMultiplier = getSpeedMultiplier();
    sideObjects.forEach(obj => {
        obj.y += 1.5 * speedMultiplier; 
        const img = new Image();
        img.src = obj.img;
        ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
    });
    for (let i = sideObjects.length - 1; i >= 0; i--) {
        if (sideObjects[i].y > canvas.height + 50) sideObjects.splice(i, 1);
    }
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const img = trafficImages[enemy.name];
        ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function getSpeedMultiplier() {
    if (score < 50) return 0.8;
    if (score < 100) return 1;
    if (score < 130) return 1.1;
    if (score < 170) return 1.3;
    if (score < 220) return 1.5;
    return 1.7; 
}

function updateEnemies() {
    const speedMultiplier = getSpeedMultiplier();
    enemies.forEach(enemy => {
        const baseSpeed = ['barrier.png', 'box.png', 'cone.png'].includes(enemy.name) ? 1.5 : 3;
        enemy.y += baseSpeed * speedMultiplier;
    });
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].y > canvas.height) {
            const isNonScoring = ['barrier.png', 'box.png', 'cone.png'].includes(enemies[i].name);
            enemies.splice(i, 1);
            if (!isNonScoring) {
                score++;
                scoreDisplay.textContent = 'Score: ' + score;
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getPlayerCurrentLaneIndex() {
    return lanes.findIndex(laneX => Math.abs(player.x + player.width / 2 - laneX) < 20);
}

function isPlayerBetweenLanes() {
    const playerCenter = player.x + player.width / 2;
    return !lanes.some(laneX => Math.abs(playerCenter - laneX) < 20);
}

function getNearestLanes() {
    const playerCenter = player.x + player.width / 2;
    const distances = lanes.map((laneX, index) => ({ laneX, index, distance: Math.abs(playerCenter - laneX) }));
    distances.sort((a, b) => a.distance - b.distance);
    return [lanes[distances[0].index], lanes[distances[1].index]];
}

function isLaneSafeToSpawn(laneX, y) {
    return !enemies.some(enemy => Math.abs(enemy.x + enemy.width / 2 - laneX) < 20 && Math.abs(enemy.y - y) < 200);
}

function spawnEnemy(laneX, y) {
    const name = trafficCars[Math.floor(Math.random() * trafficCars.length)];
    const { width, height } = scaleMap[name];
    enemies.push({ name, x: laneX - width / 2, y: y, width, height });
}

function forceBlockPlayerLanes() {
    const playerLaneIndex = getPlayerCurrentLaneIndex();
    const playerLaneX = lanes[playerLaneIndex];
    if (isLaneSafeToSpawn(playerLaneX, -100)) spawnEnemy(playerLaneX, -100);
    const possible = [];
    if (playerLaneIndex > 0) possible.push(lanes[playerLaneIndex - 1]);
    if (playerLaneIndex < lanes.length - 1) possible.push(lanes[playerLaneIndex + 1]);
    shuffleArray(possible);
    const nearbyLaneX = possible[0];
    if (nearbyLaneX && isLaneSafeToSpawn(nearbyLaneX, -100)) spawnEnemy(nearbyLaneX, -100);
}

function createSubGroups(groupSize) {
    if (groupSize <= 3) return [[...Array(groupSize).keys()]];
    const subGroup1Size = Math.floor(groupSize / 2);
    const subGroup2Size = groupSize - subGroup1Size;
    return [Array(subGroup1Size).fill(0).map((_, i) => i), Array(subGroup2Size).fill(0).map((_, i) => i)];
}

function chooseGroupSize() {
    if (score < 30) return 1;
    if (score < 60) return 2;
    if (smallGroupCounter >= 2 && Math.random() < 0.7) {
        smallGroupCounter = 0;
        return Math.floor(Math.random() * 3) + 4;
    } else {
        smallGroupCounter++;
        return Math.floor(Math.random() * 2) + 1;
    }
}

function getPreferredLanes() {
    if (score < 51 || playerLaneHistory.length < 10) return null;
    const laneCounts = new Array(lanes.length).fill(0);
    playerLaneHistory.forEach(laneIndex => laneCounts[laneIndex]++);
    const maxCount = Math.max(...laneCounts);
    return laneCounts
        .map((count, index) => ({ index, count }))
        .filter(lane => lane.count >= maxCount * 0.7)
        .map(lane => lanes[lane.index]);
}

let lastPattern = null;
const patternTypes = ['zigzag', 'tunnel', 'wall', 'scatter'];

function choosePatternType() {
    const available = patternTypes.filter(p => p !== lastPattern);
    const chosen = available[Math.floor(Math.random() * available.length)];
    lastPattern = chosen;
    return chosen;
}
function spawnPattern() {
    const currentPlayerLaneIndex = getPlayerCurrentLaneIndex();
    if (score >= 51 && currentPlayerLaneIndex >= 0) {
        playerLaneHistory.push(currentPlayerLaneIndex);
        if (playerLaneHistory.length > 50) playerLaneHistory.shift();
    }

    if (currentPlayerLaneIndex === previousPlayerLaneIndex) {
        playerStayedSameLaneCount++;
    } else {
        playerStayedSameLaneCount = 0;
    }
    previousPlayerLaneIndex = currentPlayerLaneIndex;

    if (score < 40 && isPlayerBetweenLanes()) {
        const [lane1, lane2] = getNearestLanes();
        if (isLaneSafeToSpawn(lane1, -150) && isLaneSafeToSpawn(lane2, -150)) {
            spawnEnemy(lane1, -150);
            spawnEnemy(lane2, -150);
        }
    }

    if (playerStayedSameLaneCount >= 2 && currentPlayerLaneIndex >= 0) {
        const playerLaneX = lanes[currentPlayerLaneIndex];
        if (isLaneSafeToSpawn(playerLaneX, -100)) {
            spawnEnemy(playerLaneX, -100);
            const possible = [];
            if (currentPlayerLaneIndex > 0) possible.push(lanes[currentPlayerLaneIndex - 1]);
            if (currentPlayerLaneIndex < lanes.length - 1) possible.push(lanes[currentPlayerLaneIndex + 1]);
            shuffleArray(possible);
            const nearbyLaneX = possible[0];
            if (nearbyLaneX && isLaneSafeToSpawn(nearbyLaneX, -100)) spawnEnemy(nearbyLaneX, -100);
            playerStayedSameLaneCount = 0;
            return;
        }
    }
    if (score > 75 && Math.random() < 0.3) {
        spawnEnemy(lanes[0], -100);
        spawnEnemy(lanes[5], -100);
    
    }

    const groupSize = chooseGroupSize();
    let patterns = [...allPatterns];

    patterns = patterns.filter(p => {
        if (p.length < 2) return true;
        const indices = p.map(laneX => lanes.indexOf(laneX)).sort((a, b) => a - b);
        return indices[indices.length - 1] - indices[0] <= 3;
    });

    if (score > 60) {
        if (Math.random() < 0.3) {
            patterns = patterns.filter(p => p.length >= 2 && p.length <= 4);
        } else if (Math.random() < 0.2) {
            patterns = patterns.slice().reverse();
        }
    }
    shuffleArray(patterns);

    const preferredLanes = getPreferredLanes();
    if (preferredLanes && score >= 51) {
        patterns.sort((a, b) => {
            const aScore = a.filter(lane => preferredLanes.includes(lane)).length;
            const bScore = b.filter(lane => preferredLanes.includes(lane)).length;
            return bScore - aScore;
        });
    }

    let selectedLanes = patterns.find(p => p.length <= 5) || patterns[0];
    shuffleArray(selectedLanes);
    if (selectedLanes.length > groupSize) selectedLanes = selectedLanes.slice(0, groupSize);

    const subGroups = createSubGroups(groupSize);
    let currentY = -100;
    const usedLanes = new Set();

    subGroups.forEach((subGroup, subGroupIndex) => {
        const subGroupLanes = [];
        for (let i = 0; i < subGroup.length && subGroupLanes.length < selectedLanes.length; i++) {
            const lane = selectedLanes[subGroupLanes.length];
            if (!usedLanes.has(lane)) {
                subGroupLanes.push(lane);
                usedLanes.add(lane);
            }
        }
        subGroup.forEach((_, carIndex) => {
            const laneX = subGroupLanes[carIndex];
            if (!laneX || !isLaneSafeToSpawn(laneX, currentY)) return;
            spawnEnemy(laneX, currentY);
            currentY += 20 + Math.random() * 10;
        });
        if (subGroupIndex < subGroups.length - 1) {
            currentY += 70 + Math.random() * 10;
        }
    });
}



function updatePlayer() {
    const dx = playerTargetX - player.x;
    player.x += dx * 0.1;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSidewalk();
    drawRoad();
    drawSideObjects();
    drawEnemies();
    drawPlayer();
}

function update() {
    if (gameOver) return;
    frame++;
    const speedMultiplier = getSpeedMultiplier();
    laneOffsetY += 1.5 * speedMultiplier;
    if (laneOffsetY > 40) laneOffsetY = 0;
    if ((score > 100 && frame % 140 === 0) || (score > 60 && frame % 180 === 0) || frame % 200 === 0) spawnPattern();
    updateEnemies();
    updatePlayer();
    checkCollision();
}

const halfLane = 40;
const roadLeftEdge = 30;
const roadRightEdge = canvas.width - 30;

document.addEventListener('keydown', e => {
    const nextXLeft = playerTargetX - halfLane;
    const nextXRight = playerTargetX + halfLane;
    if (e.key === 'ArrowLeft' && nextXLeft >= roadLeftEdge) playerTargetX = nextXLeft;
    if (e.key === 'ArrowRight' && nextXRight + player.width <= roadRightEdge) playerTargetX = nextXRight;
});

// ------------------- GAME LOOP -------------------
function loop() {
    if (gameStarted && !isPaused) {
        update();
        draw();
    }
    requestAnimationFrame(loop);
}
