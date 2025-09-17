let player1 = player2 = ''; // defining globally, so that we'll be able to send it to the other page as well

function chooseThisPlayerAndToggleOtherPlayer(input) {
    if (input.name === "player-1") {
        player1 = input.value;

        player2 = (player1 === 'x') ? 'o' : 'x';
        const otherPlayerRadio = document.querySelector(`#player-2-${player2}`);
        otherPlayerRadio.checked = true;
    }
    else {
        player2 = input.value;

        player1 = (player2 === 'x') ? 'o' : 'x';
        const otherPlayerRadio = document.querySelector(`#player-1-${player1}`);
        otherPlayerRadio.checked = true;
    }
}

function startTheGame() {
    if (player1 === '' && player2 === '') {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please select players first!",
        });
        return;
    }

    // else, exporting data via session storage
    sessionStorage.setItem("player1", player1);
    sessionStorage.setItem("player2", player2);

    window.location.href = "/pages/game/game.html?isMultiplayer=true";
}

window.addEventListener('load', () => {
    const radios = document.querySelectorAll(`input[type="radio"]`);
    radios.forEach(radio => radio.checked = false);
});