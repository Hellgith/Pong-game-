const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 50;
const PADDLE_SPEED = 7;
const AI_SPEED = 8;

// Game objects
let player = {
    x: 0,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#00ff99"
};

let ai = {
    x: canvas.width - PADDLE_WIDTH,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: "#ff4b4b"
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: BALL_RADIUS,
    speed: 4,
    velocityX: 4 * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 3 * (Math.random() > 0.5 ? 1 : -1),
    color: "#fff"
};

let upPressed = false;
let downPressed = false;

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#222");
    // Net
    drawNet();
    // Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    // Ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Control player paddle with mouse
canvas.addEventListener("mousemove", function(evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Prevent paddle from going out of bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height)
        player.y = canvas.height - player.height;
});

// Collision detection
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Update objects
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Paddle collision (player)
    if (collision(ball, player)) {
        ball.x = player.x + player.width + ball.radius; // Avoid stuck ball
        ball.velocityX = -ball.velocityX;

        // Add some randomness to ball direction
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Paddle collision (ai)
    if (collision(ball, ai)) {
        ball.x = ai.x - ball.radius; // Avoid stuck ball
        ball.velocityX = -ball.velocityX;

        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Score detection (left or right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        resetBall();
    }

    // AI movement (basic tracking)
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 10) {
        ai.y -= AI_SPEED;
    } else if (ball.y > aiCenter + 10) {
        ai.y += AI_SPEED;
    }
    // Clamp AI paddle to canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height)
        ai.y = canvas.height - ai.height;
}

// Game loop
function game() {
    update();
    draw();
    requestAnimationFrame(game);
}

// Start game
game();
