// 게임 상수
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // O
    '#0DFF72', // T
    '#F538FF', // S
    '#FF8E0D', // Z
    '#FFE138', // J
    '#3877FF'  // L
];

// 테트리스 블록 모양
const SHAPES = [
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // O
    [
        [2, 2],
        [2, 2]
    ],
    // T
    [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // S
    [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0]
    ],
    // Z
    [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0]
    ],
    // J
    [
        [6, 0, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 7],
        [7, 7, 7],
        [0, 0, 0]
    ]
];

// 게임 변수
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let nextCanvas = document.getElementById('nextCanvas');
let nextCtx = nextCanvas.getContext('2d');
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameRunning = false;
let gamePaused = false;

// UI 요소
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverDiv = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// 보드 초기화
function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// 블록 생성
function createPiece(type) {
    return {
        shape: SHAPES[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0,
        type: type + 1
    };
}

// 랜덤 블록 생성
function randomPiece() {
    return createPiece(Math.floor(Math.random() * SHAPES.length));
}

// 블록 회전
function rotate(piece) {
    const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
    );
    return {
        ...piece,
        shape: rotated
    };
}

// 충돌 검사
function collide(board, piece) {
    const { shape, x, y } = piece;
    for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
            if (shape[py][px]) {
                const newX = x + px;
                const newY = y + py;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// 블록을 보드에 고정
function merge(board, piece) {
    const { shape, x, y, type } = piece;
    for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
            if (shape[py][px]) {
                const newY = y + py;
                const newX = x + px;
                if (newY >= 0) {
                    board[newY][newX] = type;
                }
            }
        }
    }
}

// 라인 제거
function clearLines(board) {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // 같은 줄 다시 확인
        }
    }
    return linesCleared;
}

// 점수 계산
function updateScore(linesCleared) {
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    lines += linesCleared;
    
    // 레벨 업 (10줄마다)
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel > level) {
        level = newLevel;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    }
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// 게임 오버 검사
function checkGameOver() {
    return collide(board, currentPiece);
}

// 블록 그리기
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 테두리
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE / 3);
}

// 보드 그리기
function drawBoard() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 보드 그리기
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, COLORS[board[y][x]]);
            } else {
                // 그리드
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    
    // 현재 블록 그리기
    if (currentPiece) {
        const { shape, x, y, type } = currentPiece;
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    drawBlock(ctx, x + px, y + py, COLORS[type]);
                }
            }
        }
    }
}

// 다음 블록 그리기
function drawNextPiece() {
    nextCtx.fillStyle = '#fff';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const { shape, type } = nextPiece;
        const blockSize = 25;
        const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;
        
        for (let py = 0; py < shape.length; py++) {
            for (let px = 0; px < shape[py].length; px++) {
                if (shape[py][px]) {
                    nextCtx.fillStyle = COLORS[type];
                    nextCtx.fillRect(
                        offsetX + px * blockSize,
                        offsetY + py * blockSize,
                        blockSize,
                        blockSize
                    );
                    
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(
                        offsetX + px * blockSize,
                        offsetY + py * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
}

// 블록 이동
function movePiece(dir) {
    if (!gameRunning || gamePaused) return;
    
    const newPiece = { ...currentPiece, x: currentPiece.x + dir };
    if (!collide(board, newPiece)) {
        currentPiece = newPiece;
    }
}

// 블록 회전
function rotatePiece() {
    if (!gameRunning || gamePaused) return;
    
    const rotated = rotate(currentPiece);
    if (!collide(board, rotated)) {
        currentPiece = rotated;
    }
}

// 블록 낙하
function dropPiece() {
    if (!gameRunning || gamePaused) return;
    
    const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
    if (!collide(board, newPiece)) {
        currentPiece = newPiece;
    } else {
        merge(board, currentPiece);
        const linesCleared = clearLines(board);
        if (linesCleared > 0) {
            updateScore(linesCleared);
        }
        
        currentPiece = nextPiece;
        nextPiece = randomPiece();
        
        if (checkGameOver()) {
            gameOver();
        }
    }
}

// 즉시 낙하
function hardDrop() {
    if (!gameRunning || gamePaused) return;
    
    while (!collide(board, { ...currentPiece, y: currentPiece.y + 1 })) {
        currentPiece.y++;
    }
    dropPiece();
}

// 게임 루프
function update(time = 0) {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(update);
        return;
    }
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        dropPiece();
        dropCounter = 0;
    }
    
    drawBoard();
    drawNextPiece();
    requestAnimationFrame(update);
}

// 게임 시작
function startGame() {
    board = createBoard();
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    score = 0;
    level = 1;
    lines = 0;
    dropCounter = 0;
    dropInterval = 1000;
    gameRunning = true;
    gamePaused = false;
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    
    gameOverDiv.classList.add('hidden');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    lastTime = 0;
    update();
}

// 게임 일시정지
function pauseGame() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '재개' : '일시정지';
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    finalScoreElement.textContent = score;
    gameOverDiv.classList.remove('hidden');
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '일시정지';
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            dropPiece();
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
        case 'p':
        case 'P':
            e.preventDefault();
            pauseGame();
            break;
    }
    drawBoard();
});

// 버튼 이벤트
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', () => {
    gameOverDiv.classList.add('hidden');
    startGame();
});

// 초기화
board = createBoard();
drawBoard();

