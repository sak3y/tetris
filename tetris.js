const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Matrix representation for pieces
const matrix = [
  // T piece
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

// Checks player piece matrix with arena matrix to see if values are the occupied.
// Retuns true if occupied
const collision = (player, arena) => {
  const [m, o] = [player.matrix, player.pos];

  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0) {
        if (!arena[y + o.y] || arena[y + o.y][x + o.x] !== 0) {
          return true;
        }
      }
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

const arena = createMatrix(10, 20);

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
  pos: { x: Math.floor(arena[0].length / 2) - 1, y: 0 },
  matrix: matrix,
};

const draw = () => {
  // Canvas
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // draw pieces
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
};

const scale = 20;
canvas.width = arena[0].length * scale;
canvas.height = arena.length * scale;

// Create pieces from matrix
const drawMatrix = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      // Colour in pixels
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

// Controls for player to drop
const playerDrop = () => {
  player.pos.y++;

  // Bottom border collision checks for piece
  if (collision(player, arena)) {
    player.pos.y--;
    merge(player, arena);
    player.pos.y = 0;
  }

  dropCounter = 0;
};

// Controls for player to move left and right
const playerMove = (dir) => {
  player.pos.x += dir;

  // Piece collisions checks with side borders
  if (collision(player, arena)) {
    player.pos.x -= dir;
  }
};

// Controls to rotate piece
const playerRotate = (dir) => {
  rotate(player.matrix, dir);
};

// Rotates the pieces => don't understand how tho
const rotate = (matrix, dir) => {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }

  // Rotate clockwise or counterclockwise
  if (dir > 0) {
    matrix.forEach((row) => row.reverse()); // CW
  } else {
    matrix.reverse(); // CCW
  }
};

// Updates piece position every second
const update = (time = 0) => {
  const resTime = time - prevTime;
  prevTime = time;
  dropCounter += resTime;

  // Drops piece every second
  if (dropCounter >= dropInterval) {
    playerDrop();
  }

  // Recreates arena
  draw();
  requestAnimationFrame(update);
};

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") playerMove(-1);
  else if (e.key === "ArrowRight") playerMove(1);
  else if (e.key === "ArrowDown") playerDrop();
  else if (e.key === " ") playerDrop(); // Spacebar
  else if (e.key === "a") playerRotate(-1);
  else if (e.key === "d") playerRotate(1);
});

update();
