var height; //number of guesses
var width = 4; //number of reactions
var row = 0; //current guess (current attempt #)
var col = 0; //current "letter" for the attempt
var numChoices = 4; //Number of reagents shown on the "keyboard"
var gameOver = false;
var reactionID;
var isForward = true; // Default is forward mode


var intermediatesRevealed = {
  first: false,
  second: false,
  third: false
}

var takingInput = true;

// Fetch reagents from JSON file and initialize the board.
fetch("reactions.json")
  .then(response => response.json())
  .then(data => {
    askForDirection(); // Ask for direction before initializing
    allReagents = data.reagents; // Populate reagentsList
    height = askForNumber();
    reactionID = askForReactionID(data.reactions.length);
    answer = data.reactions[reactionID].sequence;
    // Reverse the answer if in backward mode
    if (!isForward) {
      answer = answer.reverse();  // Reverse the sequence for backward mode
    }
    reagents = generateReagents(allReagents, answer, numChoices);
    initialize(); // Initialize the board after fetching data
  })
  .catch(error => console.error('Error fetching data:', error));

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
    for (let j = 0; j < height; j++) {
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

////User Input//

function askForNumber() {
  let userInput = prompt("How many guesses would you like? (Choose a number between 1 and 5):", "4");

  // Convert the input to an integer and validate it
  let numGuesses = parseInt(userInput);

  // Ensure that the input is a valid number within the allowed range
  if (!isNaN(numGuesses) && numGuesses >= 1 && numGuesses <= 5) {
    return numGuesses;
  } else {
    alert("Invalid input. Defaulting to 4 guesses.");
    return 4;
  }
}

function askForReactionID(length) {
  let userInput = prompt("Enter Reaction ID):", "0");

  // Convert the input to an integer and validate it
  let ID = parseInt(userInput);

  // Ensure that the input is a valid number within the allowed range
  if (!isNaN(ID) && ID >= 0 && ID <= length) {
    return ID;
  } else {
    alert("Invalid input. Random reaction chosen.");
    return Math.floor(Math.random() * (length));
  }
}

function askForDirection() {
  let direction = prompt("Choose the reaction direction: (forward or backward)", "forward");
  if (direction.toLowerCase() === "backward") {
    isForward = false;
  } else {
    isForward = true; // Default to forward if input is invalid
  }
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


function checkGameover() {
  if (gameOver) {
    setTimeout(function () { alert("Success in " + row.toString() + " generation(s)!"); }, 1000)
    return;
  }
  if (row == height - 1) {
    gameOver = true;
    setTimeout(function () { alert("Game over!"); }, 1000);
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
    alert("Please enter 4 reaction conditions before submitting your guess.");
  }
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
