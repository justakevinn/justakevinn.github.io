var height = 4; //number of guesses
var width = 4; //number of reactions
var row = 0; //current guess (attempt #)
var col = 0; //current "letter" for the attempt
var gameOver = false;
var numChoices = 10;

var intermediatesRevealed = {
  first: false,
  second: false,
  third: false
}


// Fetch reagents from JSON file
fetch("https://raw.githubusercontent.com/justakevinn.github.io/858ee98d23335ae065df64e279fcf4436b6b9371/reactions.json")
  .then(response => response.json())
  .then(data => {
    allReagents = data.reagents; // Populate reagentsList
    reactionID = Math.floor(Math.random() * (data.reactions.length));
    answer = data.reactions[reactionID].sequence;
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
  for (let i = 0; i < allReagents.length && reagents.length < x; i++) {
    const reagent = allReagents[i];
    if (!answer.includes(reagent)) {
      reagents.push(reagent);
    }
  }
  shuffleArray(reagents);
  return reagents;
}






//Create 2D array for createColumn to use
function create2DArray(){
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
    rowNumber ++;
    column.appendChild(box); //adding each box to the column
  });
  return column;
}

// Function to create boxes for intermediates
function createIntermediate(columnNumber) {
  const intermediate = document.createElement('span');
  intermediate.className = 'intermediate';
  intermediate.id ='int' + columnNumber.toString()
  return intermediate;
}

// Functions to assign and display SM/Product
function createProduct() {
  const product = document.createElement('span');
  let path = "Reactions/" + reactionID.toString() + "/product.png";
  product.className = 'product';
  product.innerHTML = `<img src=` + path + ` alt="${product}">`;
  return product;
}

function createStart() {
  const start = document.createElement('span');
  let path = "Reactions/" + reactionID.toString() + "/sm.png";
  start.className = 'start';
  start.innerHTML = `<img src=` + path + ` alt="${start}">`;
  return start;
}

// Functions to reveal intermediates
function revealIntermediate(c) {
  if (c == 0 && !intermediatesRevealed.first){
    let intermediate0 = document.getElementById("int0");
    let path = "Reactions/" + reactionID.toString() + "/int0.png";
    intermediate0.innerHTML = `<img src=` + path + ` alt="${intermediate0}">`;
    intermediate0.classList.add("flip"); // Add flip class to trigger animation
    setTimeout(() => {
      const innerDiv = intermediate0.querySelector('.inner');
      innerDiv.innerHTML = `<img src="${path}" alt="Intermediate ${c}">`;
    }, 250); // Wait for the flip to reach halfway before changing content
    intermediatesRevealed.first = true;
    
  }
  else if (c == 1 && !intermediatesRevealed.second){
    let intermediate1 = document.getElementById("int1");
    let path = "Reactions/" + reactionID.toString() + "/int1.png";
    intermediate1.innerHTML = `<img src=` + path + ` alt="${intermediate1}">`;
    intermediate1.classList.add("flip"); // Add flip class to trigger animation
    setTimeout(() => {
      const innerDiv = intermediate1.querySelector('.inner');
      innerDiv.innerHTML = `<img src="${path}" alt="Intermediate ${c}">`;
    }, 250); // Wait for the flip to reach halfway before changing content
    intermediatesRevealed.second = true;
  }
  else if (c == 2 && !intermediatesRevealed.third){
    let intermediate2 = document.getElementById("int2");
    let path = "Reactions/" + reactionID.toString() + "/int2.png";
    intermediate2.innerHTML = `<img src=` + path + ` alt="${intermediate2}">`;
    intermediate2.classList.add("flip"); // Add flip class to trigger animation
    setTimeout(() => {
      const innerDiv = intermediate2.querySelector('.inner');
      innerDiv.innerHTML = `<img src="${path}" alt="Intermediate ${c}">`;
    }, 250); // Wait for the flip to reach halfway before changing content
    intermediatesRevealed.third = true;
  }
}

  //Functions to create keyboard buttons
  function createEnter() {
    const enter = document.createElement('span');
    enter.className = 'enter-button img';
    let path = "enter.png"
    enter.innerHTML = `<img src=` + path + ` alt="${enter}">`;
    enter.id = path;
    return enter
  }

  function createDelete() {
    const deletebutton = document.createElement('span');
    deletebutton.className = 'delete-button img';
    let path = "backspace.png"
    deletebutton.innerHTML = `<img src=` + path + ` alt="${deletebutton}">`;
    deletebutton.id = path;
    return deletebutton;
  }


  function createReagents(item) {
    const reagent = document.createElement('span');
    let path = "Reagents/" + item + ".png";
    reagent.className = 'reagent';
    reagent.innerHTML = `<img src=` + path + ` alt="${item}">`;
    reagent.id = item;
    return reagent
  }


    function update() {
      let correct = 0;
    
      // Loop over each box in the current row and flip it with a delay
      for (let c = 0; c < width; c++) {
        (function(c) {
          setTimeout(() => {
            let currTile = document.getElementById(row.toString() + "-" + c.toString());
            console.log("currTile: " + row.toString() + "-" + c.toString());
            currTile.classList.add("flip");
    
            setTimeout(() => {
              let letter = currTile.title;
              if (answer[c] == letter) {
                currTile.classList.add("correct");
                correct += 1;
                revealIntermediate(c);
              } else if (answer.includes(letter)) {
                currTile.classList.add("present");
              } else {
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
        row += 1; // Move to the next row
        col = 0; // Reset column
      }, width * 1000); // Delay by the total duration of all flips
    }

    function checkGameover(){
      if (gameOver){
        setTimeout(function() { alert("Success in " + row.toString() + " generation(s)!"); }, 1000);
      }
      if (row == height-1){
        gameOver = true;
        setTimeout(function() { alert("Game over!"); }, 1000);
      }
    }
  



 
  //---------------------------------------------------------------------------//
  //------------------------------ INITIALIZE  -------------------------------//
  function initialize() {
    const gridData = create2DArray();

    const board = document.getElementById('board');
    const keyboard = document.getElementById("keyboard")

    // Add product before the first column
    board.appendChild(createProduct());

    // Add columns
    let columnNumber = 0
    gridData.forEach((columnData, index) => {
      const column = createColumn(columnData, columnNumber);
      board.appendChild(column);
      // Add grey box before if not the last column
      if (index < gridData.length - 1) {
        board.appendChild(createIntermediate(columnNumber));
      }
      columnNumber++;
    });

    // Add starting compound after the last column
    board.appendChild(createStart());

    // Create Reagent Keyboard
    reagents.forEach(item => {
      keyboard.appendChild(createReagents(item));
    })
    keyboard.appendChild(createEnter());
    keyboard.appendChild(createDelete());

    //Actions
    document.addEventListener("click", (e) => {
      if (gameOver) return;
      if (e.target.classList.contains("reagent")) {
        console.log(e.target);
        if (col < width){
          let currTile = document.getElementById(row.toString() + "-" + col.toString());
          let path = "Reagents/" + e.target.id + ".png";
          currTile.innerHTML = `<img src=` + path + ` alt="${e.target.id}">`
          currTile.title = e.target.id;
          console.log("title: " + currTile.title);
          col+=1;
        }
      }

      else if (e.target.classList.contains("delete-button")) {
        if (0 < col && col <= width){
          col -=1;
        }
        let currTile = document.getElementById(row.toString() + "-" + col.toString());
        currTile.innerText = "";
      }

      else if (e.target.classList.contains("enter-button")){
        if (col!= width){
          alert("Please enter 4 reaction conditions before submitting your guess.");
        } else {
          update();
        }
      }
    });
  }
