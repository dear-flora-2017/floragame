let gameState = {
    numPlayers: 0,
    players: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    isGameOver: false,
    isAnimating: false
};

const propPool = [
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
    '🏓', '🏸', '🥎', '⛳', '🎯', '🎲', '🎮', '🎨',
    '🎸', '🎹', '🎺', '🎻', '🎤', '🎧', '📚', '✏️',
    '🔬', '🔭', '💡', '🕯️', '🎁', '🎈', '🎉', '🎀',
    '🥤', '☕', '🥛', '🧋', '🍵', '🫖', '🥣', '🥢',
    '🎪', '🎡', '🎠', '🎢', '🚗', '🚕', '🚙', '🚌',
    '🎒', '👜', '💼', '🎒', '📷', '📹', '📺', '🖥️',
    '🔔', '⏰', '📱', '⌚', '💊', '🩹', '🔑', '🔒',
    '🌸', '🌺', '🌻', '🌹', '🍀', '🌲', '🌴', '🍎',
    '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒'
];

const encouragementPrompts = [
    "Nice try! Keep going! 🌟",
    "Good effort! Practice makes perfect! 💪",
    "Don't give up! You're doing great! 🌈",
    "Almost there! Keep trying! 🚀",
    "Wonderful attempt! Next time will be even better! ⭐",
    "Great attitude! Every mistake is a step forward! 🌻",
    "You're learning! Keep it up! 🌈",
    "Awesome effort! Don't stop now! 🎉"
];

function getRandomEncouragement() {
    return encouragementPrompts[Math.floor(Math.random() * encouragementPrompts.length)];
}

let globalAvailableProps = [];

function initializeAvailableProps() {
    globalAvailableProps = [...propPool];
}

function getPropsForPlayer(count = 6) {
    const result = [];
    while (result.length < count && globalAvailableProps.length > 0) {
        const randomIndex = Math.floor(Math.random() * globalAvailableProps.length);
        result.push(globalAvailableProps.splice(randomIndex, 1)[0]);
    }
    return result;
}

function initializeEventListeners() {
    const playerButtons = document.querySelectorAll('.player-btn');
    playerButtons.forEach(btn => {
        btn.addEventListener('click', handlePlayerCountSelect);
    });

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('slide-btn').addEventListener('click', slideProp);
    document.getElementById('submit-word-btn').addEventListener('click', submitWord);
    document.getElementById('word-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitWord();
        }
    });
    document.getElementById('end-game-btn').addEventListener('click', endGame);
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
}

function handlePlayerCountSelect(e) {
    document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');

    const count = parseInt(e.target.dataset.count);
    gameState.numPlayers = count;
    showPlayerSetupForm(count);
}

function showPlayerSetupForm(count) {
    const playerInputsContainer = document.getElementById('player-inputs');
    playerInputsContainer.innerHTML = '';

    initializeAvailableProps();

    for (let i = 0; i < count; i++) {
        const randomProps = getPropsForPlayer(6);
        const row = document.createElement('div');
        row.className = 'player-input-row';
        row.innerHTML = `
            <span class="player-label">Player ${i + 1}:</span>
            <div class="prop-selector" data-player="${i}">
                ${randomProps.map((prop, idx) => `
                    <span class="prop-option ${idx === 0 ? 'selected' : ''}" data-prop="${prop}">${prop}</span>
                `).join('')}
            </div>
            <input type="text" class="name-input" placeholder="Enter name" data-player="${i}" maxlength="15">
        `;
        playerInputsContainer.appendChild(row);
    }

    playerInputsContainer.querySelectorAll('.prop-option').forEach(option => {
        option.addEventListener('click', handlePropSelection);
    });

    document.getElementById('player-setup-form').classList.remove('hidden');
}

function handlePropSelection(e) {
    const selector = e.target.closest('.prop-selector');
    selector.querySelectorAll('.prop-option').forEach(opt => opt.classList.remove('selected'));
    e.target.classList.add('selected');
}

function startGame() {
    const nameInputs = document.querySelectorAll('.name-input');
    const propSelectors = document.querySelectorAll('.prop-selector');

    let selectedProps = new Set();

    for (let i = 0; i < gameState.numPlayers; i++) {
        const name = nameInputs[i].value.trim() || `Player ${i + 1}`;
        const selectedProp = propSelectors[i].querySelector('.prop-option.selected')?.dataset.prop;

        if (!selectedProp) {
            alert('Please select a prop for all players!');
            return;
        }

        if (selectedProps.has(selectedProp)) {
            alert('Please select different props for each player!');
            return;
        }
        selectedProps.add(selectedProp);

        gameState.players.push({
            name: name,
            prop: selectedProp,
            score: 0
        });
    }

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    initializeGameBoard();
    updatePlayerCards();
}

function initializeGameBoard() {
    const propElement = document.getElementById('prop');
    propElement.textContent = gameState.players[0].prop;
    propElement.classList.remove('sliding');
    propElement.style.transform = '';
}

function updatePlayerCards() {
    const container = document.getElementById('players-container');
    container.innerHTML = '';

    gameState.players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `player-card ${index === gameState.currentPlayerIndex ? 'active' : ''}`;
        card.innerHTML = `
            <div class="player-card-header">
                <span class="player-emoji">${player.prop}</span>
                <span class="player-name">${player.name}</span>
            </div>
            <div class="player-score">
                <span class="player-score-label">Score:</span>
                ${player.score}
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('round-number').textContent = gameState.currentRound;

    const propElement = document.getElementById('prop');
    propElement.textContent = gameState.players[gameState.currentPlayerIndex].prop;
}

function slideProp() {
    if (gameState.isAnimating || gameState.isGameOver) return;

    gameState.isAnimating = true;

    const prop = document.getElementById('prop');
    const slideBtn = document.getElementById('slide-btn');
    slideBtn.disabled = true;

    animateWithGravity(prop);
}

// 道具滑行动画 - 道具从slide-zone向上滑入game-board，随机停在某个格子内
function animateWithGravity(prop) {
    const boardCells = document.querySelectorAll('.board-cell');
    const gameBoard = document.getElementById('game-board');

    const originalCellHTMLs = Array.from(boardCells).map(cell => cell.innerHTML);

    boardCells.forEach(cell => cell.classList.remove('highlighted'));

    // 预先计算目标格子和滑动距离
    const targetCellIdx = Math.floor(Math.random() * boardCells.length);
    let targetSlideDistance = 0;
    for (let i = 0; i <= targetCellIdx; i++) {
        targetSlideDistance += boardCells[i].offsetHeight;
    }

    // 计算滑动距离，确保道具始终向上滑动
    // 道具越高（index 越小），滑动距离越大
    const slideDistance = Math.max(10, prop.offsetHeight - targetSlideDistance);

    let progress = 0;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentY = -slideDistance * easeOut;
        const rotation = progress * 360;

        prop.style.transform = `translateY(${currentY}px) rotate(${rotation}deg)`;

        const propRect = prop.getBoundingClientRect();
        const boardRect = gameBoard.getBoundingClientRect();
        const currentBoardPosition = propRect.bottom - boardRect.top;

        let currentCellIdx = 0;
        let currentTop = 0;
        for (let i = 0; i < boardCells.length; i++) {
            const cellHeight = boardCells[i].offsetHeight;
            if (currentBoardPosition >= currentTop && currentBoardPosition < currentTop + cellHeight) {
                currentCellIdx = i;
                break;
            }
            currentTop += cellHeight;
        }

        boardCells.forEach((cell, idx) => {
            cell.classList.toggle('highlighted', idx === currentCellIdx);
        });

        if (progress >= 1) {
            prop.style.transition = 'transform 0.15s ease-out';
            prop.style.transform = `translateY(${currentY}px) scale(1.15) rotate(360deg)`;

            setTimeout(() => {
                prop.style.transform = `translateY(${currentY}px) scale(1) rotate(360deg)`;

                setTimeout(() => {
                    const points = parseInt(boardCells[targetCellIdx].dataset.points);
                    const cell = boardCells[targetCellIdx];

                    boardCells.forEach((c, idx) => {
                        c.classList.toggle('highlighted', idx === targetCellIdx);
                    });

                    cell.innerHTML = `<span class="cell-label">${cell.dataset.points}</span><span class="result-points">+${points}!</span>`;

                    setTimeout(() => {
                        boardCells.forEach((c, idx) => {
                            c.innerHTML = originalCellHTMLs[idx];
                            c.classList.toggle('highlighted', idx === targetCellIdx);
                        });
                        showWordModal(points, targetCellIdx);
                    }, 2500);
                }, 50);
            }, 150);
            return;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function showWordModal(points, cellIndex) {
    const letter = generateRandomLetter();
    const boardCells = document.querySelectorAll('.board-cell');

    boardCells.forEach((cell, idx) => {
        const letterDisplay = cell.querySelector('.letter-display');
        if (idx === cellIndex) {
            letterDisplay.textContent = letter;
            letterDisplay.classList.add('visible');
            cell.classList.add('highlighted');
        } else {
            letterDisplay.textContent = '';
            letterDisplay.classList.remove('visible');
            cell.classList.remove('highlighted');
        }
    });

    document.getElementById('modal-letter').textContent = letter;
    document.getElementById('modal-points').textContent = points;
    document.getElementById('word-input').value = '';
    document.getElementById('word-feedback').textContent = '';
    document.getElementById('word-feedback').className = 'feedback';
    document.getElementById('word-modal').classList.remove('hidden');

    const prop = document.getElementById('prop');
    prop.style.transform = '';

    setTimeout(() => {
        document.getElementById('word-input').focus();
    }, 100);
}

function generateRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters.charAt(Math.floor(Math.random() * letters.length));
}

function submitWord() {
    const wordInput = document.getElementById('word-input');
    const word = wordInput.value.trim();
    const letter = document.getElementById('modal-letter').textContent;
    const points = parseInt(document.getElementById('modal-points').textContent);
    const feedback = document.getElementById('word-feedback');

    if (!word) {
        feedback.textContent = 'Please enter a word!';
        feedback.className = 'feedback incorrect';
        return;
    }

    if (isWordValid(letter, word)) {
        gameState.players[gameState.currentPlayerIndex].score += points;
        feedback.textContent = `Correct! +${points} points!`;
        feedback.className = 'feedback correct';

        setTimeout(() => {
            closeModal();
            updatePlayerCards();
            nextTurn();
        }, 1500);
    } else {
        feedback.textContent = getRandomEncouragement();
        feedback.className = 'feedback neutral';

        setTimeout(() => {
            closeModal();
            nextTurn();
        }, 2000);
    }
}

function closeModal() {
    document.getElementById('word-modal').classList.add('hidden');

    const letterDisplays = document.querySelectorAll('.letter-display');
    letterDisplays.forEach(ld => {
        ld.textContent = '';
        ld.classList.remove('visible');
    });

    const cells = document.querySelectorAll('.board-cell');
    cells.forEach(cell => cell.classList.remove('highlighted'));

    document.getElementById('slide-btn').disabled = false;
}

function nextTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.numPlayers;

    if (gameState.currentPlayerIndex === 0) {
        gameState.currentRound++;
    }

    updatePlayerCards();
    gameState.isAnimating = false;
}

function endGame() {
    gameState.isGameOver = true;

    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('end-screen').classList.add('active');

    showFinalScores();
}

function showFinalScores() {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-emoji').textContent = winner.prop;

    const finalScoresContainer = document.getElementById('final-scores');
    finalScoresContainer.innerHTML = '';

    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = `final-score-row ${index === 0 ? 'winner' : ''}`;
        row.innerHTML = `
            <span class="final-score-name">${player.prop} ${player.name}</span>
            <span class="final-score-value">${player.score}</span>
        `;
        finalScoresContainer.appendChild(row);
    });
}

function resetGame() {
    gameState = {
        numPlayers: 0,
        players: [],
        currentPlayerIndex: 0,
        currentRound: 1,
        isGameOver: false,
        isAnimating: false
    };

    document.getElementById('end-screen').classList.remove('active');
    document.getElementById('setup-screen').classList.add('active');

    document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('player-setup-form').classList.add('hidden');
    document.getElementById('player-inputs').innerHTML = '';

    closeModal();
    document.getElementById('slide-btn').disabled = false;

    const prop = document.getElementById('prop');
    prop.style.transform = '';
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);