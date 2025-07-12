// Game configuration and state variables
const collectSound = new Audio('audio/canAudio.wav');
const pollutantSound = new Audio('audio/pollutantAudio.wav');
const GOAL_CANS = 20;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeRemaining      // holds the timer duration
const winMessages = [ // Array of win messages
  "Great job!",
  "You're a water can master!",
  "Keep up the good work!",
  "Fantastic collecting!",
  "You did it!",
];

const loseMessages = [ // Array of lose messages
  "Time's up!",
  "Better luck next time!",
  "Don't give up!",
  "You can do it next time!",
  "Keep practicing!",
];

// Difficulty configuration
const DIFFICULTY_SETTINGS = {
  easy: {
    pollutants: 0,
    spawnInterval: 1000,
    timer: 30,
    pollutantPenalty: 0,
  },
  medium: {
    pollutants: 2,
    spawnInterval: 750, // 25% tighter
    timer: 30,
    pollutantPenalty: 1,
  },
  hard: {
    pollutants: 3,
    spawnInterval: 670, // 33% tighter
    timer: 25,
    pollutantPenalty: 1,
  },
  veryhard: {
    pollutants: 3,
    spawnInterval: 340, // 66% tighter
    timer: 20,
    pollutantPenalty: 2,
  },
};
let currentDifficulty = 'easy';

// Modal trigger and close references
const gameModal = document.getElementById('game-modal');
const openGameBtn = document.getElementById('launch-game');
const closeGameBtn = document.getElementById('close-game');
const pageWrapper = document.getElementById('page');



// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

function displayAchievement(message) {
  // Show the modal and set its content
  const modal = document.getElementById('achievement-modal');
  const modalMessage = document.getElementById('modal-message');
  const modalScore = document.getElementById('modal-score');
  modalMessage.textContent = message;
  modalScore.textContent = `Score: ${currentCans}`;
  modal.style.display = 'flex';
}

// Close modal handler
const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    document.getElementById('achievement-modal').style.display = 'none';
  });
}

// Ensure the grid is created when the page loads
createGrid();

function getDifficultySettings() {
  return DIFFICULTY_SETTINGS[currentDifficulty];
}

// Spawns a new item in a random grid cell
function spawnItems() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));
  const settings = getDifficultySettings();
  let availableCells = Array.from(cells);

  // Place pollutants
  for (let i = 0; i < settings.pollutants; i++) {
    if (availableCells.length === 0) break;
    const idx = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[idx];
    cell.innerHTML = `
      <div class=\"pollutant-wrapper\">  
        <div class=\"pollutant\"></div>
      </div>
    `;
    availableCells.splice(idx, 1);
  }
  // Place only one water can if there is at least one available cell
  if (availableCells.length > 0) {
    const idx = Math.floor(Math.random() * availableCells.length);
    const cell = availableCells[idx];
    cell.innerHTML = `
      <div class=\"water-can-wrapper\">

        <div class=\"water-can\"></div>
      </div>
    `;
  }
}

// Updates the displayed values for cans collected and time left
function updateStatsDisplay() {
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeRemaining;
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  createGrid(); // Set up the game grid
  currentCans = 0; // Reset collected cans
  const settings = getDifficultySettings();
  timeRemaining = settings.timer; // Reset timer
  updateStatsDisplay(); // Update display at start
  spawnItems();
  spawnInterval = setInterval(spawnItems, settings.spawnInterval); // Spawn water cans every second

  // Start the timer
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateStatsDisplay(); // Update display every second
    if (timeRemaining <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop the timer

  // Show win or lose message based on cans collected
  let message = '';
  if (currentCans >= GOAL_CANS) {
    message = winMessages[Math.floor(Math.random() * winMessages.length)];
  } else {
    message = loseMessages[Math.floor(Math.random() * loseMessages.length)];
  }
  displayAchievement(message); // Display the achievement message
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Set up click handlers for grid cells to collect water cans or pollutants
document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive) return; // Ignore clicks if the game is not active
  const target = event.target;
  const settings = getDifficultySettings();
  let clicked = false;
  if (target.classList.contains('water-can')) {
    currentCans++;
    updateStatsDisplay();
    collectSound.play();
    clicked = true;
  } else if (target.closest('.pollutant')) {
    currentCans -= settings.pollutantPenalty;
    if (currentCans < 0) currentCans = 0;
    updateStatsDisplay();
    pollutantSound.play();
    clicked = true;
  }
  if (clicked) {
    spawnItems();
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnItems, settings.spawnInterval);
  }
});

// Open the game modal
if (openGameBtn) {
  openGameBtn.addEventListener('click', () => {
    gameModal.style.display = 'flex';
    document.body.classList.add('modal-open');
    pageWrapper.classList.add('blurred');
    createGrid(); // ensure fresh grid is visible
  });
}

// Close the game modal
if (closeGameBtn) {
  closeGameBtn.addEventListener('click', () => {
    gameModal.style.display = 'none';
    document.body.classList.remove('modal-open');
    // pageWrapper.classList.remove('blurred');
    endGame(); // stops the game if it’s running
  });
}

// Difficulty selection change handler
document.getElementById('difficulty-select')?.addEventListener('change', (e) => {
  currentDifficulty = e.target.value;
});


