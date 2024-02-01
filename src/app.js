const boxes = document.querySelectorAll(".box");
const turnStatus = document.getElementById("status");
const resetBtn = document.getElementById("reset-game-btn");
const newGameBtn = document.getElementById("new-game-btn");

const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

// Multiplayer
const firstPlayer = "X";
let currenPlayer = firstPlayer; // X or O here

let options = ["", "", "", "", "", "", "", "", ""];
let running = true; // flag for checking game's progress 

const updateStatus = (status) => turnStatus.innerHTML = status;
updateStatus(`${currenPlayer}'s turn`);

const checkWinner = () => {
    let winConditionMet = false;
    for (let i = 0; i < winConditions.length; i++) {
        const currentCellSet = winConditions[i];

        const cellA = options[currentCellSet[0]];
        const cellB = options[currentCellSet[1]];
        const cellC = options[currentCellSet[2]];

        if (cellA === "" || cellB === "" || cellC === "") {
            continue; // continue to the next iteration
        }

        if (cellA === cellB && cellB === cellC) {
            winConditionMet = true;
            break;
        }
    }

    if (winConditionMet) {
        updateStatus(`${currenPlayer} Won!`);
        running = false;
    } else if (!options.includes("")) {
        updateStatus("It is a tie!");
        running = false;
    } else {
        currenPlayer = currenPlayer === "X" ? "O" : "X";
        updateStatus(`${currenPlayer}'s turn`);
    }
}

boxes.forEach((box) => box.addEventListener("click", () => {
    if (box.innerHTML === "" && running) {
        box.innerHTML = currenPlayer;

        const boxIndex = Number(box.getAttribute("id").split('-')[1]);
        options[boxIndex] = currenPlayer;

        checkWinner();
    }
}));

resetBtn.addEventListener("click", () => {
    boxes.forEach((box) => box.innerHTML = "");
    options.forEach((_, index) => options[index] = "");

    running = true;

    currenPlayer = firstPlayer;
    updateStatus(`${currenPlayer}'s turn`);
});

newGameBtn.addEventListener("click", () => {
    console.log("Will work on it!");
})