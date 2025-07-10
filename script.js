// Game configuration and state variables
const GOAL_CANS = 20;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeRemaining = 30;      // Time left in seconds
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

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');

  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;
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
  timeRemaining = 30; // Reset timer
  updateStatsDisplay(); // Update display at start
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second

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
  const achievementDiv = document.getElementById('achievements');
  let message = '';
  if (currentCans >= GOAL_CANS) {
    message = winMessages[Math.floor(Math.random() * winMessages.length)];
  } else {
    message = loseMessages[Math.floor(Math.random() * loseMessages.length)];
    }
  achievementDiv.textContent = message;
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Set up click handlers for grid cells to collect water cans
document.querySelector('.game-grid').addEventListener('click', (event) => {
  if (!gameActive) return; // Ignore clicks if the game is not active
  const target = event.target;

  // Check if the clicked element is a water can
  if (target.classList.contains('water-can')) {
    currentCans++; // Increment the count of collected cans
    updateStatsDisplay(); // Update display when can is collected
    target.parentElement.remove(); // Remove the water can from the grid

    // Spawn a new can immediately after collecting one
    spawnWaterCan();

    // Reset the spawn interval to 1 second after a can is clicked
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnWaterCan, 1000);
  }
});


