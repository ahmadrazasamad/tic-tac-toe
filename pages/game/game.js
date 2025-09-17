let player1 = '', player2 = '', currentPlayer = '';

// fetching them for border manipulation
const players = document.querySelectorAll(".player") // for single player purpose
const playerXContainer = document.getElementById("player-x");
const playerOContainer = document.getElementById("player-o");

const winCounts = document.querySelectorAll(".win-count");

const xWinCount = document.getElementById("x-win-count");
const oWinCount = document.getElementById("o-win-count");

const cells = document.querySelectorAll("td");

const overlay = document.getElementById("overlay");
const winSvg = document.getElementById("win-svg");
const winLine = document.getElementById("win-line");

const gameStatusTxt = document.getElementById("game-status");

let gameStatus = 0; // wiil be 0 or 1, if draw or won by any player then this will be marked 1, else gameStatus will remain 0 (means continue the game)
let lastMoveCellIndex = -1;

const WIN_COMBOS = [ // there are total 8 winning conditions, 3 row-wise, 3 column-wise, and 2 diagonal-wise
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// ================== helper functions ==================
function setCurrentPlayerUI() {
  playerXContainer.classList.remove("current-player");
  playerOContainer.classList.remove("current-player");

  if (!currentPlayer) {
    gameStatusTxt.innerText = "Choose a player or start the game";
    return;
  }

  if (currentPlayer.toLowerCase() === 'x') {
    playerXContainer.classList.add("current-player");
    gameStatusTxt.innerText = "X's turn";
  } else {
    playerOContainer.classList.add("current-player");
    gameStatusTxt.innerText = "O's turn";
  }
}

function changeTurn() {
  if (currentPlayer === '') // if initially the current player is not yet defined
    currentPlayer = player1;
  else
    currentPlayer = (currentPlayer.toLowerCase() === 'x') ? 'o' : 'x';

  setCurrentPlayerUI();
}

function getGameResult() {
  const values = Array.from(cells, c => c.innerText.trim());

  for (const combo of WIN_COMBOS) { // checking combos
    const [a, b, c] = combo;
    if (values[a] && values[a] === values[b] && values[b] === values[c])
      return { type: "win", combo };
  }

  if (values.every(v => v)) return { type: "draw" }; // draw
  return { type: "continue" };
}

function getCellCenterInPageCoords(cell) {
  const rect = cell.getBoundingClientRect();

  return { // center point relative to page (viewport)
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

function createOrGetLine(id) {
  let el = document.getElementById(id);

  if (!el) {
    el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    el.setAttribute("id", id);
    el.setAttribute("stroke-linecap", "round");
    el.setAttribute("stroke-opacity", "0.95");
    el.setAttribute("stroke-width", "18");
    el.classList.add("win-line-dynamic");
    winSvg.appendChild(el);
  }
  return el;
}

function removeDynamicLines() {
  const ids = ["win-line-a", "win-line-b"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });

  if (winLine) {
    winLine.style.stroke = "transparent";
    winLine.style.strokeDasharray = "0";
    winLine.style.strokeDashoffset = "0";
    winLine.setAttribute("x1", 0);
    winLine.setAttribute("y1", 0);
    winLine.setAttribute("x2", 0);
    winLine.setAttribute("y2", 0);
  }
}

function animateLineDrawing(lineEl, length, duration = 700) {
  lineEl.style.transition = "none";
  lineEl.style.strokeDasharray = `${length}`;
  lineEl.style.strokeDashoffset = `${length}`;

  lineEl.getBoundingClientRect();

  lineEl.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.9,.2,1)`;

  requestAnimationFrame(() => {
    lineEl.style.strokeDashoffset = "0";
  });
}

function extendedEndpoints(ptStart, ptEnd, extraPx = 18) {
  const dx = ptEnd.x - ptStart.x;
  const dy = ptEnd.y - ptStart.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { start: ptStart, end: ptEnd };
  const ux = dx / len;
  const uy = dy / len;

  // extend start backwards a little and end forwards a little
  const start = { x: ptStart.x - ux * extraPx, y: ptStart.y - uy * extraPx };
  const end = { x: ptEnd.x + ux * extraPx, y: ptEnd.y + uy * extraPx };
  return { start, end, length: Math.hypot(end.x - start.x, end.y - start.y) };
}

function showSingleLine(startPt, endPt, color) {
  if (!winLine) return;
  removeDynamicLines(); // remove any leftover additional lines

  const ext = extendedEndpoints(startPt, endPt, 18);
  winLine.setAttribute("x1", ext.start.x);
  winLine.setAttribute("y1", ext.start.y);
  winLine.setAttribute("x2", ext.end.x);
  winLine.setAttribute("y2", ext.end.y);
  winLine.style.stroke = color;
  winLine.setAttribute("stroke-width", "18");

  animateLineDrawing(winLine, ext.length, 700);
}

function showTwoLines(midPt, end1Pt, end2Pt, color) {
  removeDynamicLines();

  // line A : mid -> end1
  const lineA = createOrGetLine("win-line-a");
  const extA = extendedEndpoints(midPt, end1Pt, 18);

  lineA.setAttribute("x1", midPt.x);
  lineA.setAttribute("y1", midPt.y);
  lineA.setAttribute("x2", extA.end.x); // used extA.end as the extended endpoint
  lineA.setAttribute("y2", extA.end.y);
  lineA.style.stroke = color;
  lineA.setAttribute("stroke-width", "18");

  const lenA = Math.hypot(extA.end.x - midPt.x, extA.end.y - midPt.y);

  lineA.style.strokeDasharray = `${lenA}`;
  lineA.style.strokeDashoffset = `${lenA}`;

  // line B : mid -> end2
  const lineB = createOrGetLine("win-line-b");
  const extB = extendedEndpoints(midPt, end2Pt, 18);
  lineB.setAttribute("x1", midPt.x);
  lineB.setAttribute("y1", midPt.y);
  lineB.setAttribute("x2", extB.end.x);
  lineB.setAttribute("y2", extB.end.y);
  lineB.style.stroke = color;
  lineB.setAttribute("stroke-width", "18");

  const lenB = Math.hypot(extB.end.x - midPt.x, extB.end.y - midPt.y);
  lineB.style.strokeDasharray = `${lenB}`;
  lineB.style.strokeDashoffset = `${lenB}`;

  // forcing reflow then animate both
  lineA.getBoundingClientRect();
  lineB.getBoundingClientRect();

  // animating with same easing / duration
  const dur = 700;
  lineA.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.2,.9,.2,1)`;
  lineB.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.2,.9,.2,1)`;

  requestAnimationFrame(() => {
    lineA.style.strokeDashoffset = "0";
    lineB.style.strokeDashoffset = "0";
  });
}

function hideWinLine() {
  removeDynamicLines();
}

function drawWinLineForCombo(combo) {
  if (!combo || combo.length !== 3 || lastMoveCellIndex < 0) return;

  const winner = cells[combo[0]].innerText.trim() || cells[combo[1]].innerText.trim() || cells[combo[2]].innerText.trim();
  const lineColor = (winner && winner.toLowerCase() === 'x') ? "#8E44FF" : "#32D1FF";

  if (lastMoveCellIndex === combo[1]) {
    const midPt = getCellCenterInPageCoords(cells[combo[1]]);
    const endA = getCellCenterInPageCoords(cells[combo[0]]);
    const endB = getCellCenterInPageCoords(cells[combo[2]]);

    showTwoLines(midPt, endA, endB, lineColor);
    return;
  }

  // otherwise draw a single line from the 'lastMove' cell to the opposite end
  if (combo.includes(lastMoveCellIndex)) {
    const startIdx = lastMoveCellIndex;
    const endIdx = (startIdx === combo[0]) ? combo[2] : combo[0];
    const startPt = getCellCenterInPageCoords(cells[startIdx]);
    const endPt = getCellCenterInPageCoords(cells[endIdx]);

    showSingleLine(startPt, endPt, lineColor);
    return;
  }

  // if last move not in this combo (should be rare), just draw full line across combo[0] -> combo[2]
  const fallbackStart = getCellCenterInPageCoords(cells[combo[0]]);
  const fallbackEnd = getCellCenterInPageCoords(cells[combo[2]]);
  showSingleLine(fallbackStart, fallbackEnd, lineColor);
}

function clearPageData() {
  cells.forEach(cell => {
    cell.innerText = '';
    cell.className = '';
  });
  gameStatus = 0; // since game is being restarted
  lastMoveCellIndex = -1;

  hideWinLine();
}

function handleResize() {
  if (gameStatus === 1 && winLine.style.stroke !== "transparent") { // only proceed if a game is won and the line is visible.
    const values = Array.from(cells, c => c.innerText.trim());
    const winningCombo = WIN_COMBOS.find(
      (combo) => values[combo[0]] && values[combo[0]] === values[combo[1]] && values[combo[1]] === values[combo[2]]
    );

    if (winningCombo)
      drawWinLineForCombo(winningCombo);
  }
}
// ================== helper functions ==================

cells.forEach((cell, i) => {
  cell.addEventListener("click", () => {
    if (gameStatus) return; // game finished
    if (cell.innerText.trim()) // if the cell already has content, then do not do anything
      return;

    // else
    if (!currentPlayer) {
      currentPlayer = player1 || 'x';
      setCurrentPlayerUI();
    }

    cell.className = "pop-in"
    cell.innerText = currentPlayer;
    cell.style.color = (currentPlayer.toLowerCase() === 'x') ? "#32D1FF" : "#8E44FF";
    lastMoveCellIndex = i; // for drawing the win line

    const result = getGameResult();
    if (result.type === "continue") {
      changeTurn();
      return;
    }

    if (result.type === "draw") {
      gameStatusTxt.innerText = "It's a draw";
      gameStatus = 1;
      return;
    }

    if (result.type === "win") {
      gameStatusTxt.innerText = `${currentPlayer} WON!`;
      gameStatus = 1;

      const winner = currentPlayer.toLowerCase();
      if (winner === 'x') {
        const n = (xWinCount.innerText === '-') ? 0 : Number(xWinCount.innerText || 0);
        xWinCount.innerText = n + 1;
        xWinCount.style.fontFamily = "Comic Sans MS, sans-serif";
      } else {
        const n = (oWinCount.innerText === '-') ? 0 : Number(oWinCount.innerText || 0);
        oWinCount.innerText = n + 1;
        oWinCount.style.fontFamily = "Comic Sans MS, sans-serif";
      }

      // drawing an animated line
      drawWinLineForCombo(result.combo);
    }
  });
});

function resetGame() {
  changeTurn(); // re-initalizing the current player, to the player opposite to the one who actually had the 1st turn in the prev. game
  clearPageData();
}

function newGame() {
  clearPageData(); // clearing the data of the page, so the browser forward button should serve any purpose
  winCounts.forEach(winCount => {
    winCount.innerText = '-';
    winCount.style.fontFamily = "bouncy";
  });
  window.location.href = "../../index.html";
}

const observer = new ResizeObserver(entries => { // line handle on resize
  handleResize();
});
const table = document.querySelector('table');
observer.observe(table);

window.addEventListener("load", () => {
  handleResize(); // initial check

  const params = new URLSearchParams(window.location.search);
  const isMultiplayerBool = params.get("isMultiplayer") === "true"; //  converting into bool

  winCounts.forEach(winCount => {
    if (winCount.innerText === '-')
      winCount.style.fontFamily = "bouncy";
  });

  if (isMultiplayerBool) {
    const p1 = sessionStorage.getItem("player1");
    const p2 = sessionStorage.getItem("player2");

    if (p1 && p2) { // if both of them are not empty then, for the case when we are on the game page in multiplayer mode and then we shut down the browser and then we again open the browser from the same page (i.e., game in the multiplayer mode), then in session storage player1 and player2 will be undefined, and hence there is need for this condition to refrain the web app from an unexpected behavior 
      player1 = p1;
      player2 = p2;

      currentPlayer = ''; // setting default current player (player1) and UI
      changeTurn();
    } else {
      params.set("isMultiplayer", "false");
      window.history.replaceState({}, "", `${location.pathname}?${params}`);
      window.location.reload();
    }
  } else { // for single player default to X
    player1 = 'x';
    player2 = 'o';

    currentPlayer = '';

    setCurrentPlayerUI();
    playerXContainer.classList.add("current-player");
    players.forEach(playerContainer => {})
  }

  hideWinLine(); // hidding any win line initially
});