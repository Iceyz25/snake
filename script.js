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
const gridSize = 40;
const canvasSize = 600;
let snake = [{ x: 270, y: 270 }];
let snakeDirection = 'right';
let food = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let gameInterval;  // Variable para guardar el intervalo del juego
// Función para generar la posición de la comida de manera aleatoria
function generateFood() {
    food.x = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize;
}

// Función para dibujar el juego
function drawGame() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', 100, canvasSize / 2);
        ctx.fillText('Puntaje: ' + score, 100, canvasSize / 2 + 40);
        return;
    }

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Dibujar la comida
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    // Dibujar la serpiente
    ctx.fillStyle = 'green';
    snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));

    // Dibujar el puntaje
    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText('Puntaje: ' + score, 10, 20);
}

// Función para mover la serpiente
function moveSnake() {
    const head = { ...snake[0] };

    if (snakeDirection === 'right') head.x += gridSize;
    if (snakeDirection === 'left') head.x -= gridSize;
    if (snakeDirection === 'up') head.y -= gridSize;
    if (snakeDirection === 'down') head.y += gridSize;

    // Verificar si la serpiente choca con los bordes
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

// Función para cambiar la dirección de la serpiente
function changeDirection(event) {
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

// Configuración para iniciar el juego
function startGame() {
    generateFood();
    // Clear the previous game interval to prevent multiple intervals from running
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    gameInterval = setInterval(() => {
        if (!gameOver) {
            moveSnake();
            drawGame();
        }
    }, 100); // Controla la velocidad del juego (100 ms entre cada actualización)
}
// Iniciar el juego cuando el botón es clickeado
document.getElementById('boton').addEventListener('click', () => {
    gameOver = false;
    score = 0;
    snake = [{ x: 270, y: 270 }];
    snakeDirection = 'right'; // Resetear dirección
    startGame();
});

canvas.addEventListener('click', () => {
    if (gameOver) {
        gameOver = false;
        score = 0;
        snake = [{ x: 270, y: 270 }];
        snakeDirection = 'right'; // Reiniciar dirección
        startGame();
    }
});

// Escuchar las teclas para cambiar la dirección
window.addEventListener('keydown', changeDirection);


