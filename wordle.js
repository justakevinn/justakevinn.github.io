// Variables that the user can change
let reactionID;
let numGuesses = 4;  // Default number of guesses
let isForward = false;  // Default direction is fackward

// Variables to hold the previous settings
let previousReactionID;
let previousNumGuesses;
let previousIsForward;

// General Parameters
var height; //number of guesses
var width = 4; //number of reactions
var row = 0; //current guess (current attempt #)
var col = 0; //current "letter" for the attempt
var numChoices = 14; //Number of reagents shown on the "keyboard"
var gameOver = false;

var intermediatesRevealed = {
  first: false,
  second: false,
  third: false
}

var takingInput = true;

let maxReactionID = 0; // Initialize variable for maximum reaction ID

// Function to fetch reactions and set maxReactionID
function fetchReactions() {
    fetch("reactions.json")
        .then(response => response.json())
        .then(data => {
            maxReactionID = data.reactions.length - 1; // Set maxReactionID based on the number of reactions
            console.log("Maximum Reaction ID:", maxReactionID); // Log the maximum Reaction ID
        })
        .catch(error => console.error('Error fetching data:', error));
}

function randomizeReactionId() {
  const randomId = Math.floor(Math.random() * (maxReactionID + 1)); // Generate a random ID between 0 and maxReactionID
  document.getElementById('reactionID').value = randomId; // Set the value of the input box to the random ID
}

// Cancel function
function cancelSettings() {
  // Revert to previous settings
  reactionID = previousReactionID;
  numGuesses = previousNumGuesses;
  isForward = previousIsForward;

  // Optionally, reset the input fields in the modal
  document.getElementById('reactionID').value = previousReactionID;
  document.getElementById('numGuesses').value = previousNumGuesses;
  document.getElementById('direction').value = isForward ? 'forward' : 'retro';

  // Hide the modal
  hideModal();
}

// Create the cancel button and add it to the modal
function createCancelButton() {
  const cancelButton = document.createElement('button');
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener('click', cancelSettings); // Attach event listener
  cancelButton.id = "cancelButton"; // Set an ID for the button if needed

  const modal = document.getElementById('settingsModal');
  if (modal) {
    modal.appendChild(cancelButton); // Append the cancel button to the modal
  } else {
    console.error("Modal not found when trying to add the cancel button!");
  }
}

// Ensure the window is fully loaded before running scripts
window.onload = function() {
  fetchReactions(); // Fetch reactions to set maxReactionID
  // Add event listeners for gear icon and save button
  const gearIcon = document.getElementById('gearIcon');
  const saveButton = document.getElementById('saveSettings');
  const cancelButton = document.getElementById('cancelButton'); // Select cancel button
  const modal = document.getElementById('settingsModal');

  // Add event listener for the gear icon click
  gearIcon.addEventListener('click', showModal);  // Show modal

  // Add event listener for the save button click
  saveButton.addEventListener('click', saveSettings);  // Save settings and hide modal

  // Add event listener for the cancel button click
  cancelButton.addEventListener('click', cancelSettings); // Cancel settings and hide modal

  // Automatically show the menu modal when user loads the page
  showModal(); // Calls function to open the menu modal
};

// Function to show modal and store previous settings
function showModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) {
    // Store previous settings before showing the modal
    previousReactionID = reactionID;
    previousNumGuesses = numGuesses;
    previousIsForward = isForward;

    modal.style.display = 'flex';  // Show modal
  }
}

// Function to hide modal
function hideModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) {
    console.log("Hiding modal...");
    modal.style.display = 'none';  // Hide modal
  } else {
    console.error("Modal not found when trying to hide it!");
  }
}

// Function to save settings
function saveSettings() {
  const reactionInput = document.getElementById('reactionID').value;
  const guessesInput = document.getElementById('numGuesses').value;
  const directionInput = document.getElementById('direction').value;

  // Save inputs
  reactionID = reactionInput ? parseInt(reactionInput) : 0;
  numGuesses = guessesInput ? parseInt(guessesInput) : 4;
  isForward = directionInput === 'forward';
  console.log("Settings saved:", { reactionID, numGuesses, isForward });
  const board = document.getElementById('board');
  const keyboard = document.getElementById('keyboard');
  board.innerHTML = '';  // Clears the old board
  keyboard.innerHTML = '';  // Clears the old keyboard

  height = numGuesses

  // escape reagents from JSON file and initialize the board
  fetch("reactions.json")
    .then(response => response.json())
    .then(data => {
      const allReagents = data.reagents;
      let answer = data.reactions[reactionID].sequence;
      let reference = data.reactions[reactionID].reference;
      if (!isForward) answer.reverse();
      const reagents = generateReagents(allReagents, answer, numChoices);

      initializeBoard(answer, reagents, reference);  // Initialize board after fetching data
    })
    .catch(error => console.error('Error fetching data:', error));

  hideModal();
}

// Function to initialize the board (part of your original code)
function initializeBoard(answer, reagents, reference) {
  row = 0; //Reset row to 0
  col = 0; //Reset column to 0
  takingInput = true; // Reset takingInput to true
  gameOver = false; // Reset gameOver to false

  window.answer = answer;

  const gridData = create2DArray();  // Call your existing function
  const board = document.getElementById('board');
  const keyboard = document.getElementById("keyboard");
  const fragment = document.createDocumentFragment();
  const ref = document.createElement('div');
  ref.classList.add('text'); // Add 'text' class for styling
  ref.textContent = reference;


  // Add product before the first column
  if (isForward) {
    fragment.appendChild(createStart());
  } else {
    fragment.appendChild(createProduct());
  }

  // Add columns and intermediates
  gridData.forEach((columnData, index) => {
    const column = createColumn(columnData, index);
    fragment.appendChild(column);
    if (index < gridData.length - 1) {
      if (isForward) {
        fragment.appendChild(createIntermediate(index));
      } else {
        fragment.appendChild(createIntermediate(gridData.length - 2 - index));
      }
      console.log("Added new columns :)");
    }
  });

  // Add starting compound after the last column
  if (isForward) {
    fragment.appendChild(createProduct()); // Add product (TGT) after last column in forward mode
  } else {
    fragment.appendChild(createStart()); // Add starting material (SM) after columns in backward mode
  }

  board.appendChild(fragment);

  // Create Reagent Keyboard
  const keyboardFragment = document.createDocumentFragment();
  reagents.forEach(item => {
    keyboardFragment.appendChild(createReagents(item));
  });
  keyboardFragment.appendChild(createEnter());
  keyboardFragment.appendChild(createDelete());
  keyboard.appendChild(keyboardFragment);

  board.appendChild(ref);

  // Event listeners
  document.addEventListener("click", handleUserInput);
  console.log("Initializing board with answer and reagents...");
}



//---------------------------- HELPER FUNCTIONS  ----------------------------//
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateReagents(allReagents, answer, x) {
  let reagents = [...answer];
  allReagents.forEach(reagent => {
    if (reagents.length < x && !answer.includes(reagent)) {
      reagents.push(reagent);
    }
  });
  shuffleArray(reagents);
  return reagents;
}

//Create 2D array for createColumn to use
function create2DArray() {
  let array = [];
  for (let i = 0; i < width; i++) {
    let row = [];
    for (let j = 0; j < numGuesses; j++) {
      row.push("");
    }
    array.push(row);
  }
  return array;
}

// Function to create a column of boxes
function createColumn(data, columnNumber) {
  const column = document.createElement('span');
  column.className = 'column';
  let rowNumber = 0;
  data.forEach(item => {
    const box = document.createElement('span');
    box.className = 'box';
    box.id = rowNumber.toString() + "-" + columnNumber.toString();
    rowNumber++;
    column.appendChild(box); // Add each box to the column
  });
  return column;
}


// Function to create boxes for intermediates
function createIntermediate(columnNumber) {
  const intermediate = document.createElement('span');
  intermediate.className = 'intermediate';
  intermediate.id = 'int' + columnNumber.toString()
  return intermediate;
}

// Functions to assign and display SM/Product
function createProduct() {
  const product = document.createElement('span'); // Change 'span' to 'div' for better layout control
  product.classList.add('product'); // Add 'start' class for styling

  // Create the image element
  const image = document.createElement('img');
  image.src = `Reactions/${reactionID.toString()}/product.png`;
  image.alt = 'Product Image'; // Update alt text for accessibility

  // Create the text element
  const text = document.createElement('div');
  text.classList.add('text'); // Add 'text' class for styling
  text.textContent = 'TGT'; // Replace with dynamic text if needed

  // Append the image and text to the start element
  product.appendChild(image);
  product.appendChild(text);

  return product;
}

function createStart() {
  const start = document.createElement('div'); // Change 'span' to 'div' for better layout control
  start.classList.add('start'); // Add 'start' class for styling

  // Create the image element
  const image = document.createElement('img');
  image.src = `Reactions/${reactionID.toString()}/sm.png`;
  image.alt = 'Start Image'; // Update alt text for accessibility

  // Create the text element
  const text = document.createElement('div');
  text.classList.add('text'); // Add 'text' class for styling
  text.textContent = 'SM'; // Replace with dynamic text if needed

  // Append the image and text to the start element
  start.appendChild(image);
  start.appendChild(text);

  return start;
}
//Functions to create keyboard buttons
function createEnter() {
  const enter = document.createElement('span');
  enter.classList = 'enter-button img';
  let path = "enter.png"
  enter.innerHTML = `<img src=` + path + ` alt="${enter}">`;
  enter.id = path;
  return enter
}

function createDelete() {
  const deletebutton = document.createElement('span');
  deletebutton.classList = 'delete-button img';
  let path = "backspace.png"
  deletebutton.innerHTML = `<img src=` + path + ` alt="${deletebutton}">`;
  deletebutton.id = path;
  return deletebutton;
}

function createReagents(item) {
  const reagent = document.createElement('span');
  let path = "Reagents/" + item + ".png";
  reagent.classList = 'reagent img';
  reagent.innerHTML = `<img src=` + path + ` alt="${item}">`;
  reagent.id = item;
  return reagent
}

function update() {
  takingInput = false;
  let correct = 0;
  // Loop over each box in the current row and flip it with a delay
  for (let c = 0; c < width; c++) {
    (function (c) {
      setTimeout(() => {
        let currTile = document.getElementById(row.toString() + "-" + c.toString());
        currTile.classList.add("flip");
        let keyboardKey = document.getElementById(currTile.title);
        setTimeout(() => {
          let letter = currTile.title;
          if (answer[c] === letter) {
            // Remove "present" and "absent" before marking as "correct"
            keyboardKey.classList.remove("present", "absent");

            currTile.classList.add("correct");
            keyboardKey.classList.add("correct");
            correct += 1;
            revealIntermediate(c);
          } else if (answer.includes(letter)) {
            if (!keyboardKey.classList.contains("correct")) {
              keyboardKey.classList.add("present");
            }
            currTile.classList.add("present");
          } else {
            if (!keyboardKey.classList.contains("correct") && !keyboardKey.classList.contains("present")) {
              keyboardKey.classList.add("absent");
            }
            currTile.classList.add("absent");
          }
        }, 250); // Wait until the tile is halfway through the flip before changing the class
      }, c * 1000); // Delay for each tile to flip sequentially
    })(c);
  }
  setTimeout(() => {
    if (correct == width) {
      gameOver = true;
    }
    checkGameover();
    takingInput = true;
    row += 1; // Move to the next row
    col = 0; // Reset column
  }, width * 1000); // Delay by the total duration of all flips
}

// Function to show the game over modal
function showGameOverModal(message) {
  const modal = document.getElementById('gameOverModal').style.display='flex';;
  const messageElement = document.getElementById('gameOverMessage');
  messageElement.textContent = message;
  modal.style.display = 'block'; // Show the modal
}

// Function to hide the game over modal
function hideGameOverModal() {
  const modal = document.getElementById('gameOverModal');
  modal.style.display = 'none'; // Hide the modal
}

// Function to show the settings/modal
function playAgain() {
  hideGameOverModal(); // Hide the game over modal first
  showModal(); // Call the function to open the settings/modal
}

// Add event listener to play again button
document.getElementById('playAgainButton').addEventListener('click', playAgain);

// Add event listener to restart the game when the restart button is clicked
/*document.getElementById('restartGameButton').addEventListener('click', function() {
  hideGameOverModal();
  initialize(); // Call your initialization function to restart the game
});*/

function checkGameover() {
  if (gameOver) {
      setTimeout(function () { 
          showGameOverModal("Success in " + row.toString() + " generation(s)!"); 
      }, 1000);
      return;
  }
  if (row == height - 1) {
      gameOver = true;
      setTimeout(function () { 
          showGameOverModal("Game over!"); 
      }, 1000);
  }
}

function revealIntermediate(c) {
  if (isForward) {
    if (c == 0 && !intermediatesRevealed.first) {
      revealIntermediateHelper(0);
    } else if (c == 1 && !intermediatesRevealed.second) {
      revealIntermediateHelper(1);
    } else if (c == 2 && !intermediatesRevealed.third) {
      revealIntermediateHelper(2);
    }
  } else {
    // Reverse the order for backward mode
    if (c == 0 && !intermediatesRevealed.third) {
      revealIntermediateHelper(2);
    } else if (c == 1 && !intermediatesRevealed.second) {
      revealIntermediateHelper(1);
    } else if (c == 2 && !intermediatesRevealed.first) {
      revealIntermediateHelper(0);
    }
  }
}

function revealIntermediateHelper(index) {
  let intermediate = document.getElementById("int" + index);
  let path = "Reactions/" + reactionID.toString() + "/int" + index + ".png";
  intermediate.innerHTML = `<img src=` + path + ` alt="${intermediate}">`;
  intermediate.classList.add("flip");
  intermediate.style.border = 'none';
}

function handleUserInput(e) {
  if (gameOver || !takingInput) return;

  const targetClass = e.target.classList;

  if (targetClass.contains("reagent")) {
    handleReagentClick(e.target);
  } else if (targetClass.contains("delete-button")) {
    handleDeleteClick();
  } else if (targetClass.contains("enter-button")) {
    handleEnterClick();
  }
}

function handleReagentClick(target) {
  if (col < width) {
    let currTile = document.getElementById(`${row}-${col}`);
    currTile.innerHTML = `<img src="Reagents/${target.id}.png" alt="${target.id}">`;
    currTile.title = target.id;
    col++;
  }
}

function handleDeleteClick() {
  if (col > 0) {
    col--;
    let currTile = document.getElementById(`${row}-${col}`);
    currTile.innerText = "";
  }
}

function handleEnterClick() {
  if (col === width) {
    update();
  } else {
    showNotification("Not enough guesses!");
  }
}

function showNotification(message) {
  const notificationContainer = document.getElementById('notificationContainer');
  const existingNotifications = notificationContainer.querySelectorAll('.notification');

  // Remove the oldest notification if there are already 3 notifications
  if (existingNotifications.length >= 3) {
    existingNotifications[0].remove(); // Remove the first (oldest) notification
  }

  // Create a new notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;

  // Append the notification to the container
  notificationContainer.appendChild(notification);

  // Set a timeout to remove the notification after a few seconds
  setTimeout(() => {
    notification.classList.add('fade-out'); // Add fade-out class
    setTimeout(() => {
      notification.remove();
    }, 500); // Wait for fade-out effect to finish before removing
  }, 1000); // Duration the notification is displayed (5 seconds)
}


//---------------------------------------------------------------------------//
//------------------------------ INITIALIZE  -------------------------------//
function initialize() {
  const gridData = create2DArray();
    const board = document.getElementById('board');
    const keyboard = document.getElementById("keyboard");
    const fragment = document.createDocumentFragment();
    

    // Add product before the first column
    if (isForward){
      fragment.appendChild(createStart());
    } else {
      fragment.appendChild(createProduct());
    }

    // Add columns and intermediates
    gridData.forEach((columnData, index) => {
        const column = createColumn(columnData, index);
        fragment.appendChild(column);
        if (index < gridData.length - 1){
          if(isForward){
            fragment.appendChild(createIntermediate(index));
          }
          else{
            fragment.appendChild(createIntermediate(gridData.length - 2 - index));
          }
        }
      })

    // Add starting compound after the last column
    if (isForward) {
      fragment.appendChild(createProduct()); // Add product (TGT) after last column in forward mode
    } else {
      fragment.appendChild(createStart()); // Add starting material (SM) after columns in backward mode
    }

    
    board.appendChild(fragment);

    // Create Reagent Keyboard
    const keyboardFragment = document.createDocumentFragment();
    reagents.forEach(item => {
        keyboardFragment.appendChild(createReagents(item));
    });
    keyboardFragment.appendChild(createEnter());
    keyboardFragment.appendChild(createDelete());
    keyboard.appendChild(keyboardFragment);

  // Event listeners
  document.addEventListener("click", handleUserInput)
}