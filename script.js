function sayHello() {
    alert("Hello from external JS!");
}

function hidePlay() {
    document.getElementById("Contenedor").style.display = "none";
    document.getElementsByClassName("blur-overlay")[0].style.display = "none";
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

const headImg = new Image();
headImg.src = "headp.png"; // Head sprite

const bodyImg = new Image();
bodyImg.src = "bodyp.png"; // Body sprite

const tailImg = new Image();
tailImg.src = "tailp.png"; // Tail sprite

const cornerImg = new Image();
cornerImg.src = "corner.png"; // ✅ Now correctly assigns the source



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

     // Draw snake
    snake.forEach((part, index) => {
        let img = bodyImg; // Default body sprite
        let angle = 0; // Default angle (no rotation)

        if (index === 0) {
            img = headImg; // Head sprite
            angle = getRotationAngle(snakeDirection); // Get rotation angle for head
        } 
        else if (index === snake.length - 1) {
            img = tailImg; // Tail sprite
            let tailDirection = getTailDirection();
            angle = getRotationAngle(tailDirection);
        } 
        else {
            // Get previous and next segment positions
            let prev = snake[index - 1];
            let next = snake[index + 1];

            // Check if the body part is a corner
            if ((prev.x < part.x && next.y > part.y) || (prev.y < part.y && next.x > part.x)) {
                img = cornerImg; // Use a corner sprite
                angle = Math.PI / 2; // Rotate for proper corner positioning
            }
            else if ((prev.x > part.x && next.y < part.y) || (prev.y > part.y && next.x < part.x)) {
                img = cornerImg; // Another type of corner
                angle = -Math.PI / 2;
            }
            else {
                // If it's a straight piece, determine horizontal or vertical orientation
                angle = (prev.x === next.x) ? Math.PI / 2 : 0;
            }
        }

        drawRotatedImage(img, part.x, part.y, angle);
    });

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

