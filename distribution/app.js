const parentDiv = document.getElementById("sp-mp-driver"); // the parent div of the next two buttons
const singlePlayerBtn = document.getElementById("sp-btn");
const multiplayerPlayerBtn = document.getElementById("mp-btn");

const xoTurnShifter = document.getElementById("xo-turn-shifter");

const mpGameSel = document.getElementById("mp-game-setting");
const strtMPGameBtn = document.getElementById("start-multiplayer-game");
const p1Choice = document.querySelectorAll(".player1-choice");
const p2Choice = document.querySelectorAll(".player2-choice");
const errorMsg1 = document.getElementById("error-msg-1");
const errorMsg2 = document.getElementById("error-msg-2");

const XWinCount = document.getElementById("x-win-count");
const OWinCount = document.getElementById("o-win-count");

const gameContainer = document.getElementById("game-container");
const boxes = document.querySelectorAll(".box");

const turnStatus = document.getElementById("status");

const resetBtn = document.getElementById("reset-game-btn");
const newGameBtn = document.getElementById("new-game-btn");

let multiPlayer = false;
let singlePlayer = false;

const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

let firstPlayer = null; // for multiplayer
let currenPlayer = null; // for multiplayer

let options = ["", "", "", "", "", "", "", "", ""];
let running = false; // flag for checking game's progress 

const updateStatus = status => turnStatus.innerHTML = status;

const hideAndShow = element => { // common funtion for hidding and making elements visible
    if (element.classList.contains("flex")) {
        element.classList.add("hidden");
        element.classList.remove("flex");
    } else {
        element.classList.remove("hidden");
        element.classList.add("flex");
    }
}

singlePlayerBtn.addEventListener("click", () => {
    hideAndShow(parentDiv); // hide
    hideAndShow(xoTurnShifter); // show

    updateStatus("Start game or select player");

    gameContainer.classList.remove("hidden");
    gameContainer.classList.add("grid");
});

multiplayerPlayerBtn.addEventListener("click", () => {
    hideAndShow(parentDiv); // hide
    hideAndShow(mpGameSel); // show
});

const toggleMpPlayerChooser = elementsClass => {
    const element = document.querySelectorAll(`.${elementsClass}:checked`)[0];
    const otherElementsClass = (elementsClass === "player1-choice") ? ".player2-choice" : ".player1-choice";
    const otherElement = document.querySelectorAll(otherElementsClass);

    const elementValue = element.value;
    otherElement.forEach(otElem => {
        if (otElem.value !== elementValue)
            otElem.checked = true;
    });

    errorMsg1.classList.add("hidden", "opacity-0", "h-0", "overflow-hidden");
    errorMsg1.classList.remove("h-auto", "opacity-100");

    errorMsg2.classList.add("hidden", "opacity-0", "h-0", "overflow-hidden");
    errorMsg2.classList.remove("h-auto", "opacity-100");
}

const toggleChangePlayersTurn = elementID => {
    if (!multiPlayer && !singlePlayer) {
        elementID = elementID.toLowerCase();
        elementID = `${elementID}-count`;
        const element = document.getElementById(elementID);
        const borderColorClass = (elementID === "x-count") ? "border-b-[#48A9A6]" : "border-b-indigo-900";
        const otherElementId = (elementID === "x-count") ? "o-count" : "x-count";
        const otherElement = document.getElementById(otherElementId);

        [element, otherElement].forEach(el => { // Removing border classes from both elements
            el.classList.remove("border-b-[10px]", "border-b-[#48A9A6]", "border-b-indigo-900");
        });

        element.classList.add("border-b-[10px]", borderColorClass); // adding border classes to target element
    }
    if (!singlePlayer) {
        singlePlayer = true;
        // single player's info functionality will be done here
        // running = true; // we should start the game in here too
    }
}

strtMPGameBtn.addEventListener("click", () => {
    let p1C = null;
    let p2C = null;
    p1Choice.forEach(p1 => {
        if (p1.checked)
            p1C = p1.value;
    });
    p2Choice.forEach(p2 => {
        if (p2.checked)
            p2C = p2.value;
    });

    if (p1C && p2C) {
        hideAndShow(mpGameSel); // hide
        hideAndShow(xoTurnShifter); // show

        firstPlayer = p1C;
        currenPlayer = firstPlayer;
        toggleChangePlayersTurn(currenPlayer);
        updateStatus(`${currenPlayer}'s turn`);

        gameContainer.classList.remove("hidden");
        gameContainer.classList.add("grid");

        multiPlayer = true;
        running = true; // game started
    } else if (!p1C && !p2C) {
        errorMsg1.classList.remove("hidden");
        errorMsg2.classList.remove("hidden");

        setTimeout(() => {
            errorMsg1.classList.remove("opacity-0", "h-0", "overflow-hidden");
            errorMsg1.classList.add("h-auto", "opacity-100");
        }, 5)
        setTimeout(() => {
            errorMsg2.classList.remove("opacity-0", "h-0", "overflow-hidden");
            errorMsg2.classList.add("h-auto", "opacity-100");
        }, 5)
    }
});

const checkWinner = () => {
    let winConditionMet = false;
    for (let i = 0; i < winConditions.length; i++) {
        const currentCellSet = winConditions[i];

        const cellA = options[currentCellSet[0]];
        const cellB = options[currentCellSet[1]];
        const cellC = options[currentCellSet[2]];

        if (cellA === "" || cellB === "" || cellC === "")
            continue; // continue to the next iteration

        if (cellA === cellB && cellB === cellC) {
            winConditionMet = true;
            break;
        }
    }

    if (winConditionMet) {
        updateStatus(`${currenPlayer} Won!`);
        running = false;

        if (currenPlayer === 'X') {
            if (isNaN(XWinCount.innerHTML))
                XWinCount.innerHTML = 1;
            else
                XWinCount.innerHTML++;
        } else {
            if (isNaN(OWinCount.innerHTML))
                OWinCount.innerHTML = 1;
            else
                OWinCount.innerHTML++;
        }
    } else if (!options.includes("")) {
        updateStatus("It is a tie!");
        running = false;
    } else {
        currenPlayer = currenPlayer === "X" ? "O" : "X";
        updateStatus(`${currenPlayer}'s turn`);
        toggleChangePlayersTurn(currenPlayer);
    }
}

// Multiplayer
boxes.forEach((box) => box.addEventListener("click", () => {
    if (box.innerHTML === "" && running && multiPlayer) {
        currenPlayer === "X" ? box.classList.add("text-[#48A9A6]") : box.classList.add("text-indigo-800");
        box.innerHTML = currenPlayer;

        const boxIndex = Number(box.getAttribute("id").split('-')[1]);
        options[boxIndex] = currenPlayer;

        checkWinner();
    }
}));

const clearValues = () => {
    boxes.forEach((box) => {
        box.innerHTML = "";
        box.classList.remove("text-[#48A9A6]", "text-indigo-800");
    });
    options.forEach((_, index) => options[index] = ""); // here 1st parameter is ignored
}

resetBtn.addEventListener("click", () => {
    clearValues();

    running = true;

    currenPlayer = firstPlayer;
    toggleChangePlayersTurn(currenPlayer);
    updateStatus(`${currenPlayer}'s turn`);
});

newGameBtn.addEventListener("click", () => {
    clearValues();

    firstPlayer = null;
    currenPlayer = null;
    running = false;

    hideAndShow(parentDiv); // show
    hideAndShow(xoTurnShifter); // hide
    gameContainer.classList.remove("grid");
    gameContainer.classList.add("hidden");

    XWinCount.innerHTML = "-";
    OWinCount.innerHTML = "-";

    if (multiPlayer) {
        p1Choice.forEach(choice => {
            if (choice.checked)
                choice.checked = false;
        })
        p2Choice.forEach(choice => {
            if (choice.checked)
                choice.checked = false;
        })
        multiPlayer = false;
    }
    singlePlayer ? singlePlayer = false : null; // if true then set false else do nothing
});