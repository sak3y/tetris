const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Matrix representation for pieces
const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const collision = (player, arena) => {
  const [m, o] = [player.matrix, player.pos];

  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m.length; ++x) {
      if (m[y][x] !== 0 && arena[y + o.y] && arena[y + o.y][x + o.x] !== 0) return true;
    }
  }

  return false;
};

const createMatrix = (w, h) => {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
};

const arena = createMatrix(20, 10);

// Combine player matrix with arena
const merge = (player, arena) => {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
};

// Control position and pieces
const player = {
  pos: { x: 5, y: 5 },
  matrix: matrix,
};

const draw = () => {
  // Canvas
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // draw player pieces
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
};

const scale = 10;

// Create pieces
const drawMatrix = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      // Colour in pixels to represent the pieces
      if (value === 1) {
        context.fillStyle = "red";
        context.fillRect((x + offset.x) * scale, (y + offset.y) * scale, scale, scale);
      }
    });
  });
};

let dropCounter = 0;
let dropInterval = 1000;
let prevTime = 0;

const playerDrop = () => {
  player.pos.y++;

  if (collision(player, arena)) {
    player.pos.y--;
    merge(player, arena);
    player.pos.y = 0;
  }

  dropCounter = 0;
};

const playerMove = (dir) => {
  player.pos.x += dir;

  if (collision(player, arena)) {
    player.pos.x -= dir;
  }
};

const update = (time = 0) => {
  const resTime = time - prevTime;
  prevTime = time;
  dropCounter += resTime;

  // Update piece position ever 1 second
  if (dropCounter >= dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
};

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") playerMove(-1);
  else if (e.key === "ArrowRight") playerMove(1);
  else if (e.key === "ArrowDown") playerDrop();
});

update();
