var grid = [1, 2, 3, 4, 5, 6, 7, 8, 0 ];
var COLS = 3;
var ROWS = grid.length / COLS;
var SHUFFLES = 35;

var MOV_LEFT = 0;
var MOV_RIGHT = 1;
var MOV_UP = 2;
var MOV_DOWN = 3;

var tiles = document.querySelectorAll('#stage button');
var textTime = document.getElementById('time');
var buttonShuffle = document.getElementById('shuffle');
var stage = document.getElementById('stage');
var stageSection = document.querySelector('#stage section');
var wrapper = document.getElementById('wrapper');

var timer = null;
var startTime = 0;

function getRow(index) {
  return Math.floor(index / COLS);
}

function getCol(index) {
  return (index % COLS);
}

function render() {
  grid.forEach(function (value, index) {
    var col = getCol(index) + 1;
    var row = getRow(index) + 1;
    var element = document.getElementById(value);
    if (element === null) {
      return;
    }
    element.classList.remove('c1', 'c2', 'c3', 'r1', 'r2', 'r3');
    element.classList.add('c' + col, 'r' + row);
  });
}

function swap(a, b) {
  var tmp = grid[a];
  grid[a] = grid[b];
  grid[b] = tmp;
}

function getSpacePossibleMoves(reverseDir) {
  var index = grid.indexOf(0);
  var possibleMoves = new Set([MOV_LEFT, MOV_RIGHT, MOV_UP, MOV_DOWN]);
  if (index % COLS == COLS - 1)
    possibleMoves.delete(MOV_RIGHT);
  if (index % COLS == 0)
    possibleMoves.delete(MOV_LEFT);
  if (Math.floor(index / ROWS) == 0)
    possibleMoves.delete(MOV_UP);
  if (Math.floor(index / ROWS) == ROWS - 1)
    possibleMoves.delete(MOV_DOWN);
  possibleMoves.delete(reverseDir);
  return Array.from(possibleMoves);
}

function moveSpace(direction) {
  var index = grid.indexOf(0);
  var step = 0;
  switch (direction) {
    case MOV_LEFT: case MOV_UP:
      step = -1;
      break;
    case MOV_RIGHT: case MOV_DOWN:
      step = 1;
      break;
    default:
      step = 0;
  }
  if ([MOV_LEFT, MOV_RIGHT].indexOf(direction) > -1) {
    // horizontal
    var inc = index + step;
    if (inc < 2 || inc >= 0) {
      swap(index, inc);
    }
  } else {
    // vertical
    var inc = index + (ROWS * step);
    if (inc < grid.length || inc >= 0) {
      swap(index, inc);
    }
  }
  render();
}

function moveHorizontal(index) {
  var col = getCol(index);
  if (col == 0) {
    if (grid[index + 1] == 0)
      swap(index, index + 1);
  } else if (col == COLS - 1) {
    if (grid[index - 1] == 0)
      swap(index, index - 1);
  } else {
    if (grid[index + 1] == 0)
      swap(index, index + 1);
    else if (grid[index - 1] == 0)
      swap(index, index - 1);
  }
}

function moveVertical(index) {
  var row = getRow(index);
  if (row == 0) {
    if (grid[index + ROWS] == 0)
      swap(index, index + ROWS);
  } else if (row == ROWS - 1) {
    if (grid[index - ROWS] == 0)
      swap(index, index - ROWS);
  } else {
    if (grid[index + ROWS] == 0)
      swap(index, index + ROWS);
    else if (grid[index - ROWS] == 0)
      swap(index, index - ROWS);
  }
}

function shuffle(steps) {
  var i = 0;
  var prevDir = -1;
  tiles.forEach(function (tile) {
    tile.classList.add('fast');
  });
  var loop = setInterval(function () {
    var reverseDir = -1;
    if (prevDir == MOV_DOWN)
      reverseDir = MOV_UP;
    if (prevDir == MOV_UP)
      reverseDir = MOV_DOWN;
    if (prevDir == MOV_LEFT)
      reverseDir = MOV_RIGHT;
    if (prevDir == MOV_RIGHT)
      reverseDir = MOV_LEFT;
    var possibleMoves = getSpacePossibleMoves(reverseDir);
    var dir = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    moveSpace(dir);
    prevDir = dir;
    i++;
    if (i >= steps) {
      clearInterval(loop);
      enableTiles();
      document.getElementById('stage').classList.remove('done');
      buttonShuffle.disabled = false;
      tiles.forEach(function (tile) {
        tile.classList.remove('fast');
      });
      return;
    }
  }, 90);
  disableTiles();
  buttonShuffle.disabled = true;
}

function formatTime(time) {
  var minutes = Math.floor(time / 60).toString().padStart(2, '0');
  var seconds = Math.floor(time % 60).toString().padStart(2, '0');
  var millis = Math.floor((time % 1) * 100).toString().padStart(2, '0');
  return minutes + ':' + seconds + '.<small>' + millis + '</small>';
}

function startTimer() {
  if (timer !== null) {
    return;
  }
  startTime = (new Date()).getTime();
  timer = setInterval(function () {
    var diff = ((new Date()).getTime() - startTime) / 1000;
    textTime.innerHTML = formatTime(diff);
  }, 16);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function resetTimer() {
  stopTimer();
  startTime = 0;
  textTime.innerHTML = formatTime(0);
}

function checkCompleted() {
  for (var i = 0; i < grid.length - 2; ++i) {
    if (grid[i + 1] < grid[i]) {
      return;
    }
  }
  document.getElementById('stage').classList.add('done');
  disableTiles();
  stopTimer();
}

function disableTiles() {
  tiles.forEach(function (button) {
    button.disabled = true;
  });
}

function enableTiles() {
  tiles.forEach(function (button) {
    button.disabled = false;
  });
}

function resizeStage() {
  var wrapperStyle = getComputedStyle(wrapper);
  var paddingLeft = parseInt(wrapperStyle.getPropertyValue('padding-left'));
  var paddingRight = parseInt(wrapperStyle.getPropertyValue('padding-right'));
  var width = parseInt(wrapperStyle.getPropertyValue('width'));
  var adjustedWidth = width - paddingLeft - paddingRight;
  while (adjustedWidth % 3 != 0) {
    adjustedWidth--;
  }
  stage.style.fontSize = (adjustedWidth / 24) + 'px';
  stage.style.width = adjustedWidth + 'px';
  stageSection.style.height = adjustedWidth + 'px';
}

tiles.forEach(function (button) {
  button.onclick = function (e) {
    var tileId = e.target.id;
    var index = grid.indexOf(parseInt(tileId));
    moveHorizontal(index);
    moveVertical(index);
    render();
    startTimer();
    checkCompleted();
  }
});

buttonShuffle.onclick = function () {
  resetTimer();
  shuffle(SHUFFLES);
}

window.onload = function () {
  resizeStage();
  render();
  shuffle(SHUFFLES);
};

window.onresize = resizeStage;
