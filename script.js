// ==========================================
// CENTRE COIN - POOL CALCULATOR
// ==========================================

let game = {
    round: 0,
    players: [],
    pool: 0,
    initialAmount: 0,
    history: [],
    started: false
};


// ==========================================
// CREATE PLAYER NAME INPUTS
// ==========================================

function createPlayerNameInputs() {

    const playerCount = parseInt(
        document.getElementById("playerCount").value
    );

    const container =
        document.getElementById("playerNamesContainer");

    if (!container) {
        return;
    }

    if (!playerCount || playerCount < 2) {
        container.innerHTML = "";
        return;
    }

    if (playerCount > 20) {
        container.innerHTML = `
            <div class="message error">
                Maximum 20 players allowed.
            </div>
        `;
        return;
    }

    let html = "";

    for (let i = 0; i < playerCount; i++) {

        html += `
            <div class="input-group">
                <label>Player ${i + 1} Name</label>

                <input
                    type="text"
                    id="playerName${i}"
                    placeholder="Enter player ${i + 1} name"
                    maxlength="30"
                    autocomplete="off"
                >
            </div>
        `;
    }

    container.innerHTML = html;
}


// ==========================================
// START FIRST GAME
// ==========================================

function startGame() {

    if (game.started) {

        showMessage(
            "Game is already running. Use Start New Round.",
            "error"
        );

        return;
    }


    const playerCount = parseInt(
        document.getElementById("playerCount").value
    );

    const initialAmount = parseFloat(
        document.getElementById("initialAmount").value
    );


    // ======================================
    // VALIDATE PLAYER COUNT
    // ======================================

    if (!playerCount || playerCount < 2) {

        showMessage(
            "Minimum 2 players required.",
            "error"
        );

        return;
    }


    if (playerCount > 20) {

        showMessage(
            "Maximum 20 players allowed.",
            "error"
        );

        return;
    }


    // ======================================
    // VALIDATE INITIAL AMOUNT
    // ======================================

    if (!initialAmount || initialAmount <= 0) {

        showMessage(
            "Enter a valid initial amount.",
            "error"
        );

        return;
    }


    // ======================================
    // GET PLAYER NAMES
    // ======================================

    const players = [];

    for (let i = 0; i < playerCount; i++) {

        const nameInput =
            document.getElementById(`playerName${i}`);

        if (!nameInput) {

            showMessage(
                "Please create player name fields first.",
                "error"
            );

            return;
        }


        const playerName =
            nameInput.value.trim();


        if (!playerName) {

            showMessage(
                `Please enter name for Player ${i + 1}.`,
                "error"
            );

            nameInput.focus();

            return;
        }


        // ==================================
        // CHECK DUPLICATE NAMES
        // ==================================

        const duplicate =
            players.some(
                player =>
                    player.name.toLowerCase() ===
                    playerName.toLowerCase()
            );


        if (duplicate) {

            showMessage(
                `Player name "${playerName}" is already used.`,
                "error"
            );

            nameInput.focus();

            return;
        }


        players.push({

            id: i + 1,

            name: playerName,

            // Initial amount is deducted
            // from every player
            balance: -initialAmount

        });

    }


    // ======================================
    // CREATE GAME
    // ======================================

    game.players = players;

    game.initialAmount = initialAmount;

    // Initial contribution from every player
    game.pool =
        playerCount * initialAmount;

    game.round = 1;

    game.history = [];

    game.started = true;


    // ======================================
    // SAVE INITIAL CONTRIBUTIONS
    // ======================================

    addInitialContributionHistory();


    // ======================================
    // UI RESET
    // ======================================

    document.getElementById(
        "newRoundSection"
    ).style.display = "none";


    document.getElementById(
        "lastTransactionSection"
    ).style.display = "none";


    updateUI();


    showMessage(
        `Round 1 started. ₹${formatMoney(initialAmount)} deducted from every player. Pool = ₹${formatMoney(game.pool)}`,
        "success"
    );
}


// ==========================================
// INITIAL CONTRIBUTION HISTORY
// ==========================================

function addInitialContributionHistory() {

    game.players.forEach(player => {

        game.history.unshift({

            type: "INITIAL",

            round: game.round,

            player: player.name,

            amount: game.initialAmount,

            balanceBefore: 0,

            balanceAfter: player.balance,

            poolAmount: game.initialAmount,

            time: new Date().toLocaleTimeString()

        });

    });

}


// ==========================================
// UPDATE COMPLETE UI
// ==========================================

function updateUI() {

    updatePool();

    updatePlayers();

    updatePlayerDropdown();

    updateHistory();

    updateSettlement();


    document.getElementById(
        "roundNumber"
    ).textContent = game.round;


    // ======================================
    // ROUND COMPLETED
    // ======================================

    if (
        game.pool === 0 &&
        game.started
    ) {

        document.getElementById(
            "newRoundSection"
        ).style.display = "block";


        document.getElementById(
            "poolStatus"
        ).textContent = "COMPLETED";


        document.getElementById(
            "poolStatus"
        ).className =
            "status completed";

    }

    // ======================================
    // ROUND ACTIVE
    // ======================================

    else {

        document.getElementById(
            "newRoundSection"
        ).style.display = "none";


        document.getElementById(
            "poolStatus"
        ).textContent = "ACTIVE";


        document.getElementById(
            "poolStatus"
        ).className =
            "status active";
    }
}


// ==========================================
// UPDATE POOL
// ==========================================

function updatePool() {

    document.getElementById(
        "poolAmount"
    ).textContent =
        formatMoney(game.pool);
}


// ==========================================
// UPDATE PLAYERS
// ==========================================

function updatePlayers() {

    const container =
        document.getElementById(
            "playersContainer"
        );


    if (
        !game.started ||
        game.players.length === 0
    ) {

        container.innerHTML = `
            <div class="empty">
                Start a round to add players.
            </div>
        `;

        return;
    }


    container.innerHTML =
        game.players.map(player => {

            let balanceClass = "zero";


            if (player.balance > 0) {
                balanceClass = "positive";
            }


            if (player.balance < 0) {
                balanceClass = "negative";
            }


            return `

                <div class="player-card">

                    <div class="player-top">

                        <span class="player-name">
                            ${escapeHTML(player.name)}
                        </span>

                        <span>
                            #${player.id}
                        </span>

                    </div>


                    <div class="player-balance ${balanceClass}">
                        ₹${formatMoney(player.balance)}
                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// PLAYER DROPDOWN
// ==========================================

function updatePlayerDropdown() {

    const select =
        document.getElementById(
            "betPlayer"
        );


    if (!game.started) {

        select.innerHTML =
            `<option value="">Select Player</option>`;

        return;
    }


    select.innerHTML = `

        <option value="">
            Select Player
        </option>

        ${game.players.map(player => `

            <option value="${player.id}">
                ${escapeHTML(player.name)}
            </option>

        `).join("")}

    `;
}


// ==========================================
// SUBMIT WIN / LOSS
// ==========================================

function submitResult(result) {

    if (!game.started) {

        showMessage(
            "Please start the game first.",
            "error"
        );

        return;
    }


    // ======================================
    // CHECK POOL
    // ======================================

    if (game.pool === 0) {

        showMessage(
            "Pool is ₹0. Start a new round.",
            "error"
        );

        return;
    }


    const playerId =
        parseInt(
            document.getElementById(
                "betPlayer"
            ).value
        );


    const betAmount =
        parseFloat(
            document.getElementById(
                "betAmount"
            ).value
        );


    // ======================================
    // VALIDATE PLAYER
    // ======================================

    if (!playerId) {

        showMessage(
            "Please select a player.",
            "error"
        );

        return;
    }


    // ======================================
    // VALIDATE BET
    // ======================================

    if (
        !betAmount ||
        betAmount <= 0
    ) {

        showMessage(
            "Please enter a valid bet amount.",
            "error"
        );

        return;
    }


    // ======================================
    // FIND PLAYER
    // ======================================

    const player =
        game.players.find(
            p => p.id === playerId
        );


    if (!player) {

        showMessage(
            "Player not found.",
            "error"
        );

        return;
    }


    // ======================================
    // SAVE OLD VALUES
    // ======================================

    const poolBefore =
        game.pool;


    const balanceBefore =
        player.balance;


    let poolAfter;

    let balanceAfter;


    // ======================================
    // WIN
    // ======================================

    if (result === "WIN") {

        // Pool pays the player

        poolAfter =
            game.pool - betAmount;


        balanceAfter =
            player.balance + betAmount;
    }


    // ======================================
    // LOSS
    // ======================================

    else {

        // Player pays into pool

        poolAfter =
            game.pool + betAmount;


        balanceAfter =
            player.balance - betAmount;
    }


    // ======================================
    // UPDATE VALUES
    // ======================================

    game.pool =
        poolAfter;


    player.balance =
        balanceAfter;


    // ======================================
    // SAVE BET TRANSACTION
    // ======================================

    game.history.unshift({

        type: "BET",

        round: game.round,

        player: player.name,

        bet: betAmount,

        result: result,

        poolBefore: poolBefore,

        poolAfter: poolAfter,

        balanceBefore: balanceBefore,

        balanceAfter: balanceAfter,

        time: new Date().toLocaleTimeString()

    });


    // ======================================
    // CLEAR CURRENT BET INPUTS
    // ======================================

    document.getElementById(
        "betAmount"
    ).value = "";


    document.getElementById(
        "betPlayer"
    ).value = "";


    // ======================================
    // UPDATE UI
    // ======================================

    updateUI();


    showLastTransaction(
        game.history[0]
    );


    // ======================================
    // RESULT MESSAGE
    // ======================================

    if (result === "WIN") {

        showMessage(

            `${player.name} WIN ₹${formatMoney(betAmount)}. Pool = ₹${formatMoney(game.pool)}`,

            "success"

        );

    }

    else {

        showMessage(

            `${player.name} LOSS ₹${formatMoney(betAmount)}. Pool = ₹${formatMoney(game.pool)}`,

            "error"

        );

    }


    // ======================================
    // ROUND COMPLETED
    // ======================================

    if (game.pool === 0) {

        document.getElementById(
            "newRoundSection"
        ).style.display = "block";


        document.getElementById(
            "poolStatus"
        ).textContent =
            "COMPLETED";


        document.getElementById(
            "poolStatus"
        ).className =
            "status completed";
    }
}


// ==========================================
// START NEW ROUND
// ==========================================

function startNewRound() {

    if (!game.started) {

        showMessage(
            "Please start the first game.",
            "error"
        );

        return;
    }


    // ======================================
    // POOL MUST BE ZERO
    // ======================================

    if (game.pool !== 0) {

        showMessage(
            "Current pool must become ₹0 before starting a new round.",
            "error"
        );

        return;
    }


    // ======================================
    // INCREASE ROUND
    // ======================================

    game.round++;


    const balanceRecords = [];


    // ======================================
    // DEDUCT INITIAL AMOUNT
    // FROM EVERY PLAYER
    // ======================================

    game.players.forEach(player => {

        const balanceBefore =
            player.balance;


        player.balance =
            player.balance -
            game.initialAmount;


        balanceRecords.push({

            player: player.name,

            balanceBefore:
                balanceBefore,

            balanceAfter:
                player.balance

        });

    });


    // ======================================
    // CREATE NEW POOL
    // ======================================

    game.pool =
        game.players.length *
        game.initialAmount;


    // ======================================
    // SAVE INITIAL CONTRIBUTION
    // FOR EVERY PLAYER
    // ======================================

    balanceRecords.forEach(record => {

        game.history.unshift({

            type: "INITIAL",

            round: game.round,

            player: record.player,

            amount:
                game.initialAmount,

            balanceBefore:
                record.balanceBefore,

            balanceAfter:
                record.balanceAfter,

            poolAmount:
                game.initialAmount,

            time:
                new Date().toLocaleTimeString()

        });

    });


    // ======================================
    // CLEAR CURRENT BET INPUTS ONLY
    // ======================================

    document.getElementById(
        "betAmount"
    ).value = "";


    document.getElementById(
        "betPlayer"
    ).value = "";


    document.getElementById(
        "lastTransactionSection"
    ).style.display = "none";


    // ======================================
    // UPDATE UI
    // ======================================

    updateUI();


    showMessage(

        `Round ${game.round} started. ₹${formatMoney(game.initialAmount)} deducted from every player. Pool = ₹${formatMoney(game.pool)}`,

        "success"

    );
}


// ==========================================
// LAST TRANSACTION
// ==========================================

function showLastTransaction(transaction) {

    if (
        !transaction ||
        transaction.type !== "BET"
    ) {
        return;
    }


    const section =
        document.getElementById(
            "lastTransactionSection"
        );


    const container =
        document.getElementById(
            "lastTransaction"
        );


    section.style.display =
        "block";


    const resultClass =
        transaction.result === "WIN"
            ? "win"
            : "loss";


    container.innerHTML = `

        <div class="transaction">

            <div class="transaction-top">

                <span class="transaction-player">
                    ${escapeHTML(transaction.player)}
                </span>


                <span class="transaction-result ${resultClass}">
                    ${transaction.result}
                </span>

            </div>


            <div class="transaction-details">

                <div>
                    Bet

                    <strong>
                        ₹${formatMoney(transaction.bet)}
                    </strong>
                </div>


                <div>
                    Pool Before

                    <strong>
                        ₹${formatMoney(transaction.poolBefore)}
                    </strong>
                </div>


                <div>
                    Pool After

                    <strong>
                        ₹${formatMoney(transaction.poolAfter)}
                    </strong>
                </div>

            </div>

        </div>

    `;
}


// ==========================================
// HISTORY
// ==========================================

function updateHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );


    if (!game.history.length) {

        container.innerHTML = `

            <div class="empty">
                No transactions yet.
            </div>

        `;

        return;
    }


    container.innerHTML =
        game.history.map(transaction => {


            // ==================================
            // INITIAL CONTRIBUTION
            // ==================================

            if (
                transaction.type === "INITIAL"
            ) {

                return `

                    <div class="transaction">

                        <div class="transaction-top">

                            <span class="transaction-player">
                                ${escapeHTML(transaction.player)}
                            </span>


                            <span class="transaction-result loss">
                                INITIAL
                            </span>

                        </div>


                        <div class="transaction-details">

                            <div>
                                Round

                                <strong>
                                    ${transaction.round}
                                </strong>
                            </div>


                            <div>
                                Contribution

                                <strong>
                                    -₹${formatMoney(
                                        transaction.amount
                                    )}
                                </strong>
                            </div>


                            <div>
                                Pool Added

                                <strong>
                                    ₹${formatMoney(
                                        transaction.poolAmount
                                    )}
                                </strong>
                            </div>

                        </div>


                        <div class="transaction-details">

                            <div>
                                Balance Before

                                <strong>
                                    ₹${formatMoney(
                                        transaction.balanceBefore
                                    )}
                                </strong>
                            </div>


                            <div>
                                Balance After

                                <strong>
                                    ₹${formatMoney(
                                        transaction.balanceAfter
                                    )}
                                </strong>
                            </div>


                            <div>
                                Time

                                <strong>
                                    ${transaction.time}
                                </strong>
                            </div>

                        </div>

                    </div>

                `;
            }


            // ==================================
            // BET TRANSACTION
            // ==================================

            const resultClass =
                transaction.result === "WIN"
                    ? "win"
                    : "loss";


            return `

                <div class="transaction">

                    <div class="transaction-top">

                        <span class="transaction-player">
                            ${escapeHTML(transaction.player)}
                        </span>


                        <span class="transaction-result ${resultClass}">
                            ${transaction.result}
                        </span>

                    </div>


                    <div class="transaction-details">

                        <div>
                            Round

                            <strong>
                                ${transaction.round}
                            </strong>
                        </div>


                        <div>
                            Bet

                            <strong>
                                ₹${formatMoney(
                                    transaction.bet
                                )}
                            </strong>
                        </div>


                        <div>
                            Pool After

                            <strong>
                                ₹${formatMoney(
                                    transaction.poolAfter
                                )}
                            </strong>
                        </div>

                    </div>


                    <div class="transaction-details">

                        <div>
                            Balance Before

                            <strong>
                                ₹${formatMoney(
                                    transaction.balanceBefore
                                )}
                            </strong>
                        </div>


                        <div>
                            Balance After

                            <strong>
                                ₹${formatMoney(
                                    transaction.balanceAfter
                                )}
                            </strong>
                        </div>


                        <div>
                            Time

                            <strong>
                                ${transaction.time}
                            </strong>
                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


// ==========================================
// SETTLEMENT
// ==========================================

function updateSettlement() {

    const container =
        document.getElementById(
            "settlementContainer"
        );


    if (
        !game.started ||
        !game.players.length
    ) {

        container.innerHTML = `

            <div class="empty">
                No settlement available.
            </div>

        `;

        return;
    }


    container.innerHTML =
        game.players.map(player => {

            let valueClass =
                "zero";


            if (player.balance > 0) {
                valueClass =
                    "positive";
            }


            if (player.balance < 0) {
                valueClass =
                    "negative";
            }


            const sign =
                player.balance > 0
                    ? "+"
                    : "";


            return `

                <div class="settlement-row">

                    <span class="settlement-name">
                        ${escapeHTML(player.name)}
                    </span>


                    <span class="settlement-value ${valueClass}">
                        ${sign}₹${formatMoney(
                            player.balance
                        )}
                    </span>

                </div>

            `;

        }).join("");
}


// ==========================================
// CLEAR HISTORY
// ==========================================

function clearHistory() {

    if (!game.started) {
        return;
    }


    game.history = [];


    document.getElementById(
        "lastTransactionSection"
    ).style.display = "none";


    updateHistory();


    showMessage(
        "Transaction history cleared.",
        "success"
    );
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(text, type) {

    const message =
        document.getElementById(
            "message"
        );


    message.textContent =
        text;


    message.className =
        "message " + type;


    setTimeout(() => {

        message.className =
            "message";

    }, 4000);
}


// ==========================================
// MONEY FORMAT
// ==========================================

function formatMoney(amount) {

    return Number(amount).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


// ==========================================
// CREATE NAME FIELDS WHEN PAGE LOADS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createPlayerNameInputs();

    }
);