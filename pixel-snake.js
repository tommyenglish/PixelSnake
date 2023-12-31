const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');

const tileSize = 20;
const tileCount = canvas.width / tileSize;

let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 8, y: 9 },
    { x: 7, y: 9 },
];
let velocity = { x: 0, y: 0 };
let fruit = { x: 15, y: 15 };
let fruitsEaten = 0;
let bugs = [];
let bugsEaten = 0;
let maxConcurrentBugs = 0;
let keyPresses = 0;
let gameOver = false;
const skull = [ // nice attempt at a skull by ChatGPT
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
];

function gameLoop() {
    if (gameOver) {
        gameOverDude();
    } else if (velocity.x != 0 || velocity.y != 0) {
        moveSnake();
        moveBugs();
        checkSnakeCollisions();
        draw();
    }

    setTimeout(gameLoop, 100);
}

function moveSnake() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
    snake.unshift(head);

    let onFruit = head.x === fruit.x && head.y === fruit.y;
    let onBug = bugs.some(bug => bug.x === head.x && bug.y === head.y);

    if (onBug) {
        bugsEaten++;
        bugs = bugs.filter(bug => !(bug.x === head.x && bug.y === head.y));
    } else if (onFruit) {
        fruitsEaten++;
        placeFruit();

        if (fruitsEaten % 4 === 0) {
            placeBug();
        }
    }

    maxConcurrentBugs = Math.max(maxConcurrentBugs, bugs.length);

    if (!onFruit && !onBug) {
        snake.pop();
    }
}

function moveBugs() {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
    ];

    for (let i = 0; i < bugs.length; i++) {
        let bug = bugs[i];

        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const newPosition = { x: bug.x + randomDirection.x, y: bug.y + randomDirection.y };

        if (
            newPosition.x >= 0 && newPosition.x < tileCount &&
            newPosition.y >= 0 && newPosition.y < tileCount &&
            isOpenPosition(newPosition)
        ) {
            bugs[i] = newPosition;
        }
    }
}

function checkSnakeCollisions() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        gameOver = true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
            gameOver = true;
        }
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'lime';
    for (const part of snake) {
        ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(fruit.x * tileSize, fruit.y * tileSize, tileSize, tileSize);

    ctx.fillStyle = 'blue';
    for (let bug of bugs) {
        ctx.fillRect(bug.x * tileSize, bug.y * tileSize, tileSize, tileSize);
    }

    document.getElementById('snakeLength').textContent = snake.length;
    document.getElementById('fruitEaten').textContent = fruitsEaten;
    document.getElementById('bugsEaten').textContent = bugsEaten;
    document.getElementById('mostConcurrentBugs').textContent = maxConcurrentBugs;
    document.getElementById('keyPresses').textContent = keyPresses;
}

function placeFruit() {
    let newPosition;

    do {
        newPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
        };
    } while (!isOpenPosition(newPosition));

    fruit = newPosition;
}
function placeBug() {
    let newPosition;

    do {
        newPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
        };
    } while (!isOpenPosition(newPosition));

    bugs.push(newPosition);
}

function isOpenPosition(position) {
    return !isPositionOnSnake(position) && !isPositionOnFruit(position) && !isPositionOnBug(position)
}
function isPositionOnSnake(position) {
    return snake.some(part => part.x === position.x && part.y === position.y);
}
function isPositionOnFruit(position) {
    return fruit.x === position.x && fruit.y === position.y;
}
function isPositionOnBug(position) {
    return bugs.some(bug => bug.x === position.x && bug.y === position.y);
}

function gameOverDude() {
    document.getElementById('gameOverMessage').style.display = 'block';
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the skull
    for (let y = 0; y < skull.length; y++) {
        for (let x = 0; x < skull[y].length; x++) {
            if (skull[y][x] === 1) {
                ctx.fillStyle = 'white';
            } else if (skull[y][x] === 2) {
                ctx.fillStyle = 'black';
            } else {
                continue;
            }

            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function resetSnake() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 8, y: 9 },
        { x: 7, y: 9 },
    ];
    velocity = { x: 0, y: 0 };
}

function resetGame() {
    // Reset tracked values
    fruitsEaten = 0;
    bugsEaten = 0;
    keyPresses = 0;
    maxConcurrentBugs = 0;

    // Hide game over message
    document.getElementById('gameOverMessage').style.display = 'none';

    // Reset the fruit, bugs and snake positions, draw, and start the game loop
    fruit = { x: 15, y: 15 };
    bugs = [];
    resetSnake();
    draw();
    gameOver = false;
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (velocity.y === 0) velocity = { x: 0, y: -1 };
            keyPresses++;
            break;
        case 'ArrowDown':
            if (velocity.y === 0) velocity = { x: 0, y: 1 };
            keyPresses++;
            break;
        case 'ArrowLeft':
            if (velocity.x === 0) velocity = { x: -1, y: 0 };
            keyPresses++;
            break;
        case 'ArrowRight':
            if (velocity.x === 0) velocity = { x: 1, y: 0 };
            keyPresses++;
            break;
        case 'Enter':
            if (gameOver) resetGame();
            break;
    }
});

resetGame();
gameLoop();
