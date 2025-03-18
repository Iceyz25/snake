function sayHello() {
    alert("Hello from external JS!");
}

function hidePlay() {
    document.getElementById("Contenedor").style.display = "none";
    document.getElementsByClassName("blur-overlay")[0].style.display = "none";
}

// Obtener el canvas y su contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
const gridSize = 30;
const canvasSize = 600;
let snake = [{ x: 270, y: 270 }];
let snakeDirection = null; // No se mueve hasta que el jugador presione una tecla
let food = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let gameStarted = false; // Nuevo: evita que se mueva antes de presionar una tecla
let gameInterval;

// Función para generar la posición de la comida
function generateFood() {
    food.x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
}
// Load the grid background sprite
const gridImage = new Image();
gridImage.src = "grid_sprite.png"; // Replace with your sprite file

// Función para dibujar el juego
function drawGame() {
    if (gameOver) {
        ctx.fillStyle = 'yellow';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', 200, canvasSize / 2);
        ctx.fillText('Puntaje: ' + score, 200, canvasSize / 2 + 40);
        return;
    }

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
        // Draw the background sprite
    ctx.drawImage(gridImage, 0, 0, canvasSize, canvasSize);

    // Dibujar la comida
    ctx.fillStyle = 'yellow';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    // Dibujar la serpiente
    ctx.fillStyle = 'purple';
    snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));

    // Dibujar el puntaje
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
    generateFood();
    gameStarted = false; // No empieza hasta que el jugador presione una tecla
    snakeDirection = null; // No se mueve hasta que presione una tecla
    gameOver = false;
    score = 0;
    snake = [{ x: 270, y: 270 }];

    // Eliminar intervalos anteriores para evitar velocidad doble
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {
        if (!gameOver) {
            moveSnake();
            drawGame();
        }
    }, 100);
}

// Reiniciar el juego al hacer clic en el canvas
canvas.addEventListener('click', () => {
    if (gameOver) {
        startGame();
    }
});

// Iniciar el juego cuando el botón es clickeado
document.getElementById('boton').addEventListener('click', startGame);

// Escuchar las teclas para cambiar la dirección
window.addEventListener('keydown', changeDirection);


