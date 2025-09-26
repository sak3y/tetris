const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");


context.fillStyle = "#000";
context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

// Matrix rep for pieces
const matrix = [
    [0,0,0],
    [1,1,1],
    [0,1,0],
];