

function hidePlay() {
    document.getElementById("parentContenedor").style.display = "none";
    document.getElementsByClassName("blur-overlay")[0].style.display = "none";
}
function showRetry() {
    document.getElementById("Retry-leaderboard").style.display = "flex";
    document.getElementsByClassName("blur-overlay")[0].style.display = "block";
}
function hideRetry() {
    document.getElementById("Retry-leaderboard").style.display = "none";
}

function drawRotatedImage(image, x, y, angle) {
    ctx.save(); // Save current canvas state
    ctx.translate(x + gridSize / 2, y + gridSize / 2); // Move origin to center of the tile
    ctx.rotate(angle); // Rotate by calculated angle
    ctx.drawImage(image, -gridSize / 2, -gridSize / 2, gridSize, gridSize); // Draw centered
    ctx.restore(); // Restore original state
}
function getRotationAngle(direction) {
    switch (direction) {
        case 'right': return 0;
        case 'down': return Math.PI / 2;
        case 'left': return Math.PI;
        case 'up': return -Math.PI / 2;
        default: return 0;
    }
}
function getTailDirection() {
    let tail = snake[snake.length - 1];
    let beforeTail = snake[snake.length - 2];

    if (beforeTail.x < tail.x) return 'right';
    if (beforeTail.x > tail.x) return 'left';
    if (beforeTail.y < tail.y) return 'down';
    if (beforeTail.y > tail.y) return 'up';
    
    return 'right'; // Default
}

// Obtener el canvas y su contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
const gridSize = 30;
const canvasSize = 600;
let playerName = "";
let snake = [
    { x: 270, y: 270 }, // Head
    { x: 240, y: 270 }, // Body
    { x: 210, y: 270 } 
    ];// Tail
let snakeDirection = null; // No se mueve hasta que el jugador presione una tecla
let food = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let gameStarted = false; // Nuevo: evita que se mueva antes de presionar una tecla
let gameInterval;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Verificar si ya existe una entrada con el mismo nombre y puntaje
    let existingEntry = leaderboard.find(entry => entry.name === playerName && entry.score === score);
    if (!existingEntry) {
        // Agregar el nuevo puntaje solo si no está duplicado
        leaderboard.push({ name: playerName, score: score });

        // Ordenar de mayor a menor puntaje
        leaderboard.sort((a, b) => b.score - a.score);

        // Mantener solo los 5 mejores
        leaderboard = leaderboard.slice(0, 5);

        // Guardar en `localStorage`
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    }
}


function displayLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    let leaderboardDiv = document.getElementById("leaderboard");

    // Limpiar contenido antes de actualizar
    leaderboardDiv.innerHTML = "<h2>Leaderboard</h2>";

    leaderboard.forEach((entry, index) => {
        leaderboardDiv.innerHTML += `<p>${index + 1}. ${entry.name} - ${entry.score}</p>`;
    });
}


// Función para generar la posición de la comida
function generateFood() {
    food.x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
}
// Load the grid background sprite
const gridImage = new Image();
gridImage.src = "grid_sprite.png"; // Replace with your sprite file

const headImg = new Image();
headImg.src = "headp.png"; // Head sprite

const bodyImg = new Image();
bodyImg.src = "bodyp.png"; // Body sprite

const tailImg = new Image();
tailImg.src = "tailp.png"; // Tail sprite

const cornerImg = new Image();
cornerImg.src = "corner.png"; // ✅ Now correctly assigns the source

const foodImg = new Image(); // ✅ New: Food sprite
foodImg.src = "star.png";   // Replace with your food sprite file (e.g., an apple)

function isCorner(prev, part, next) {
    return (
        (prev.x !== next.x && prev.y !== next.y) // Detects a turn (corner)
    );
}

function getCornerRotation(prev, part, next) {
    if (prev.x < part.x && next.y < part.y || next.x < part.x && prev.y < part.y) return 0; // ↘
    if (prev.x > part.x && next.y < part.y || next.x > part.x && prev.y < part.y) return Math.PI / 2; // ↙
    if (prev.x > part.x && next.y > part.y || next.x > part.x && prev.y > part.y) return Math.PI; // ↖
    if (prev.x < part.x && next.y > part.y || next.x < part.x && prev.y > part.y) return -Math.PI / 2; // ↗
    return 0;
}

function drawGame() {
    if (gameOver) {
        ctx.fillStyle = 'yellow';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', 200, canvasSize / 2);
        ctx.fillText('Puntaje: ' + score, 200, canvasSize / 2 + 40);
        return;
    }

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.drawImage(gridImage, 0, 0, canvasSize, canvasSize);
    
    ctx.drawImage(foodImg, food.x, food.y, gridSize, gridSize);
    

    
    snake.forEach((part, index) => {
        let img = bodyImg;
        let angle = 0;

        if (index === 0) {
            img = headImg;
            angle = getRotationAngle(snakeDirection);
        } else if (index === snake.length - 1) {
            img = tailImg;
            angle = getRotationAngle(getTailDirection());
        } else {
            let prev = snake[index - 1];
            let next = snake[index + 1];
            
            if (isCorner(prev, part, next)) {
                img = cornerImg;
                angle = getCornerRotation(prev, part, next);
            } else {
                angle = (prev.x === next.x) ? Math.PI / 2 : 0;
            }
        }

        drawRotatedImage(img, part.x, part.y, angle);
    });

    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText('Puntaje: ' + score, 10, 20);
}


// Función para mover la serpiente
function moveSnake() {
    if (!gameStarted || !snakeDirection) return; // No se mueve si no ha comenzado

    const head = { ...snake[0] };

    if (snakeDirection === 'right') head.x += gridSize;
    if (snakeDirection === 'left') head.x -= gridSize;
    if (snakeDirection === 'up') head.y -= gridSize;
    if (snakeDirection === 'down') head.y += gridSize;

    // Verificar colisión con los bordes
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        gameOver = true;
        return;
    }

    // Verificar si la serpiente choca consigo misma
    if (snake.some(part => part.x === head.x && part.y === head.y)) {
        gameOver = true;
        return;
    }

    snake.unshift(head);

    // Verificar si la serpiente comió la comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();
    } else {
        snake.pop();
    }
}

// Función para cambiar la dirección de la serpiente y empezar el juego
function changeDirection(event) {
    if (!gameStarted) {
        gameStarted = true; // Ahora sí empieza el juego
    }

    if (event.key === 'ArrowUp' && snakeDirection !== 'down') {
        snakeDirection = 'up';
    }
    if (event.key === 'ArrowDown' && snakeDirection !== 'up') {
        snakeDirection = 'down';
    }
    if (event.key === 'ArrowLeft' && snakeDirection !== 'right') {
        snakeDirection = 'left';
    }
    if (event.key === 'ArrowRight' && snakeDirection !== 'left') {
        snakeDirection = 'right';
    }
}

// Función para iniciar o reiniciar el juego
function startGame() {
    playerName = document.getElementById("usernameInput").value.trim();
    
    if (!playerName) {
        alert("Please enter a name to play!");
        return;
    }
    hidePlay();
    hideRetry();
    generateFood();
    gameStarted = false; // No empieza hasta que el jugador presione una tecla
    snakeDirection = null; // No se mueve hasta que presione una tecla
    gameOver = false;
    score = 0;
    snake = [
        { x: 270, y: 270 }, // Head
        { x: 240, y: 270 }, // Middle segment
        { x: 210, y: 270 }  // Tail
    ];
    // Eliminar intervalos anteriores para evitar velocidad doble
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {
        if (!gameOver) {
            moveSnake();
            drawGame();
        } else {
            showRetry();
            updateLeaderboard();
            displayLeaderboard();
        }
    }, 105);
}


// Iniciar el juego cuando el botón es clickeado
document.getElementById('boton').addEventListener('click', startGame);
document.getElementById('boton2').addEventListener('click', startGame);
// Escuchar las teclas para cambiar la dirección
window.addEventListener('keydown', changeDirection);
