//---------------------------- GLOBAL VARIABLES ----------------------------//

let reactionID, previousReactionID;
let numGuesses = 4, previousNumGuesses;
let isForward = true, previousIsForward;
let height, width = 4, row = 0, col = 0;
let numChoices = 14, gameOver = false, takingInput = true;

const intermediatesRevealed = { first: false, second: false, third: false };

//---------------------------- MODAL FUNCTIONS ----------------------------//

function cancelSettings() {
  // Revert to previous settings and update modal fields
  Object.assign({ reactionID, numGuesses, isForward }, { previousReactionID, previousNumGuesses, previousIsForward });
  document.getElementById('reactionID').value = previousReactionID;
  document.getElementById('numGuesses').value = previousNumGuesses;
  document.getElementById('direction').value = isForward ? 'forward' : 'backward';
  hideModal();
}

function showModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) {
    [previousReactionID, previousNumGuesses, previousIsForward] = [reactionID, numGuesses, isForward];
    modal.style.display = 'flex';
  }
}

function hideModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';
}

function saveSettings() {
  reactionID = parseInt(document.getElementById('reactionID').value) || 0;
  numGuesses = parseInt(document.getElementById('numGuesses').value) || 4;
  isForward = document.getElementById('direction').value === 'forward';
  initializeBoardData();
  hideModal();
}

//---------------------------- INITIALIZATION ----------------------------//

window.onload = function () {
  document.getElementById('gearIcon').addEventListener('click', showModal);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('cancelButton').addEventListener('click', cancelSettings);
  document.getElementById('playAgainButton').addEventListener('click', playAgain);
  document.getElementById('restartGameButton').addEventListener('click', initialize);
  showModal();
};

function initialize() {
  row = col = 0;
  gameOver = false;
  initializeBoardData();
}

function initializeBoardData() {
  const board = document.getElementById('board');
  const keyboard = document.getElementById('keyboard');
  board.innerHTML = '';
  keyboard.innerHTML = '';
  fetch("reactions.json")
    .then(response => response.json())
    .then(data => {
      const allReagents = data.reagents;
      let answer = data.reactions[reactionID].sequence;
      if (!isForward) answer.reverse();
      const reagents = generateReagents(allReagents, answer, numChoices);
      initializeBoard(answer, reagents);
    })
    .catch(error => console.error('Error fetching data:', error));
}

//---------------------------- BOARD & KEYBOARD CREATION ----------------------------//

function initializeBoard(answer, reagents) {
  takingInput = true;
  window.answer = answer;
  const gridData = create2DArray();

  const fragment = document.createDocumentFragment();
  fragment.appendChild(isForward ? createStart() : createProduct());

  gridData.forEach((columnData, index) => {
    fragment.appendChild(createColumn(columnData, index));
    if (index < gridData.length - 1) fragment.appendChild(createIntermediate(index));
  });
  fragment.appendChild(isForward ? createProduct() : createStart());

  document.getElementById('board').appendChild(fragment);

  const keyboardFragment = document.createDocumentFragment();
  reagents.forEach(item => keyboardFragment.appendChild(createReagents(item)));
  keyboardFragment.appendChild(createEnter());
  keyboardFragment.appendChild(createDelete());
  document.getElementById('keyboard').appendChild(keyboardFragment);
}

//---------------------------- GAME FUNCTIONS ----------------------------//

function update() {
  if (col !== width) return showNotification("Not enough guesses!");
  takingInput = false;

  for (let c = 0; c < width; c++) {
    setTimeout(() => {
      let currTile = document.getElementById(`${row}-${c}`);
      currTile.classList.add("flip");
      setTimeout(() => updateTileState(currTile, c), 250);
    }, c * 1000);
  }
  setTimeout(() => {
    checkGameover();
    row++;
    col = 0;
    takingInput = true;
  }, width * 1000);
}

function updateTileState(currTile, index) {
  let letter = currTile.title;
  let keyboardKey = document.getElementById(letter);

  if (answer[index] === letter) {
    keyboardKey.classList.add("correct");
    currTile.classList.add("correct");
    revealIntermediate(index);
  } else if (answer.includes(letter)) {
    keyboardKey.classList.add("present");
    currTile.classList.add("present");
  } else {
    keyboardKey.classList.add("absent");
    currTile.classList.add("absent");
  }
}

function checkGameover() {
  if (gameOver || row >= height) {
    gameOver = true;
    showGameOverModal(row === height ? "Game over!" : `Success in ${row} generation(s)!`);
  }
}

//---------------------------- HELPER FUNCTIONS ----------------------------//

function create2DArray() {
  return Array.from({ length: width }, () => Array(numGuesses).fill(""));
}

function generateReagents(allReagents, answer, x) {
  const reagents = [...answer];
  allReagents.forEach(reagent => !answer.includes(reagent) && reagents.length < x && reagents.push(reagent));
  shuffleArray(reagents);
  return reagents;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//---------------------------- UI COMPONENTS CREATION ----------------------------//

function createColumn(data, columnNumber) {
  const column = document.createElement('span');
  column.className = 'column';
  data.forEach((_, rowNumber) => {
    const box = document.createElement('span');
    box.className = 'box';
    box.id = `${rowNumber}-${columnNumber}`;
    column.appendChild(box);
  });
  return column;
}

function createIntermediate(index) {
  const intermediate = document.createElement('span');
  intermediate.className = 'intermediate';
  intermediate.id = `int${index}`;
  return intermediate;
}

function createProduct() {
  const product = document.createElement('div');
  product.classList.add('product');
  product.innerHTML = `<img src="Reactions/${reactionID}/product.png" alt="Product Image"><div class="text">TGT</div>`;
  return product;
}

function createStart() {
  const start = document.createElement('div');
  start.classList.add('start');
  start.innerHTML = `<img src="Reactions/${reactionID}/sm.png" alt="Start Image"><div class="text">SM</div>`;
  return start;
}

function createEnter() {
  const enter = document.createElement('span');
  enter.className = 'enter-button img';
  enter.innerHTML = `<img src="enter.png" alt="Enter">`;
  return enter;
}

function createDelete() {
  const del = document.createElement('span');
  del.className = 'delete-button img';
  del.innerHTML = `<img src="backspace.png" alt="Delete">`;
  return del;
}

function createReagents(item) {
  const reagent = document.createElement('span');
  reagent.className = 'reagent img';
  reagent.innerHTML = `<img src="Reagents/${item}.png" alt="${item}">`;
  return reagent;
}
