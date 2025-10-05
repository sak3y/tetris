const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Clear a row each time it's filled
const arenaSweep = () => {
  let rowScore = 1;
  // Continue if the row contains a 0
  outer: for (let i = arena.length - 1; i > 0; --i) {
    for (let j = 0; j < arena[i].length; ++j) {
      if (arena[i][j] === 0) {
        continue outer;
      }
    }
    // Clear is all row elements != 0
    const row = arena.splice(i, 1)[0].fill(0);
    arena.unshift(row); // Unsure
    ++i; // Increment the column once cleared

    // Gives player points
    player.score += rowScore * 10;
    document.getElementById("status").innerHTML = `+${rowScore * 10}`;
    rowScore *= 2;

    setTimeout(() => {
      document.getElementById("status").innerHTML = "";
    }, 2500);
  }
};

// Checks player piece matrix with arena matrix to see if values are the occupied. Retuns true if occupied
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

const createPiece = (type) => {
  if (type === "T") {
    return [
      // T piece
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === "O") {
    return [
      // Box piece
      [2, 2],
      [2, 2],
    ];
  } else if (type === "L") {
    return [
      // L piece
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  } else if (type === "J") {
    return [
      // J piece
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  } else if (type === "S") {
    return [
      // S piece
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
  } else if (type === "Z") {
    return [
      // Z piece
      [6, 6, 0],
      [0, 6, 6],
      [0, 0, 0],
    ];
  } else if (type === "I") {
    return [
      // Line piece
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0],
    ];
  }
};

const arena = createMatrix(10, 20);

// Combine player matrix with arena
const merge = (player, arena) => {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value >= 1) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
};

// Player object
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

const colours = [null, "#FF4136", "#FFDC00", "#2ECC40", "#B10DC9", "#FF851B", "#F012BE", "#0074D9"];

const draw = () => {
  // Canvas
  context.fillStyle = "#0f0f0fff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#282727ff"; //  grid colour
  context.lineWidth = 1;

  // Draw the grid
  for (let x = 0; x < canvas.width; x += scale) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  for (let y = 0; y < canvas.height; y += scale) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  // draw pieces
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
};

// Dimensions
const scale = 10;
canvas.width = arena[0].length * scale;
canvas.height = arena.length * scale;

// Create pieces from matrix
const drawMatrix = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      // Fill in pieces
      if (value >= 1) {
        const px = (x + offset.x) * scale;
        const py = (y + offset.y) * scale;

        // Gives colour
        context.fillStyle = colours[value];
        context.fillRect(px, py, scale, scale);
        // Gives grid look
        context.strokeStyle = "#151515ff";
        context.lineWidth = 0.5;
        context.strokeRect(px, py, scale, scale);
      }
    });
  });
};

const playSound = (key) => {
  // if (key === 1) {
  //   const audio = new Audio("assets/sounds/");
  //   try {
  //     audio.play();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // } else if (key === 2) {
  //   const audio = new Audio("assets/sounds/movepiece.mp3");
  //   try {
  //     audio.play();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
};

let dropCounter = 0;
let dropInterval = 1000;
let prevTime = 0;

// Controls for player to drop
const playerDrop = () => {
  player.pos.y++;

  // Bottom border collision checks for piece + resets piece + checks to see if
  // the row is full and clears it + updates the score and resets the players position
  if (collision(player, arena)) {
    player.pos.y--;
    merge(player, arena);
    playerReset();
    arenaSweep();
    updateScore();
    player.pos.y = 0;
  }

  dropCounter = 0;
};

// Instantly place a piece
const playerPlace = () => {
  while (!collision(player, arena)) {
    player.pos.y++;
  }
  player.pos.y--;
  merge(player, arena);
  playerReset();
  arenaSweep();
  updateScore();
};

// Controls for player to move left and right
const playerMove = (dir) => {
  player.pos.x += dir;
  playSound(1);

  // Piece collisions checks with side borders
  if (collision(player, arena)) {
    player.pos.x -= dir;
  }
};

// Resets pieces
const playerReset = () => {
  const pieces = "LISTJOZ";

  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  // Reset stats on loss and clear rows
  if (collision(player, arena)) {
    player.score = 0;
    updateScore();
    arena.forEach((row) => row.fill(0));
  }
};

// Controls for piece rotation
const playerRotate = (dir) => {
  const pos = player.pos.x;
  let offset = 1;

  rotate(player.matrix, dir); // Rotates pieces in direction

  // Rotation checks with borders
  while (collision(player, arena)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
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

const updateScore = () => {
  document.getElementById("score").innerText = player.score;
};

// Player controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") playerMove(-1);
  else if (e.key === "ArrowRight") playerMove(1);
  else if (e.key === "ArrowDown") {
    playSound(1);
    playerDrop();
  } else if (e.key === " ") playerPlace(); // Spacebar
  else if (e.key === "ArrowUp") playerRotate(1);
  else if (e.key === "a" || e.key === "A") {
    playerRotate(1);
    playerRotate(1);
  } else if ((e.key === "z") | (e.key === "Z")) playerRotate(1);
  else if ((e.key === "x") | (e.key === "X")) playerRotate(-1);
});

playerReset();
update();
