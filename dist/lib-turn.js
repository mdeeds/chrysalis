var dx;
var dy;
resetTurn = function () {
  dx = 0;
  dy = 0;
}
goNorth = function () {
  delta.drive = 1.0;
  dy = -1
}
goSouth = function () {
  delta.drive = 1.0;
  dy = 1
}
goEast = function () {
  delta.drive = 1.0;
  dx = -1
}
goWest = function () {
  delta.drive = 1.0;
  dx = 1
}
setTurn = function () {
  let desiredAngle = 0;
  if (dx != 0 || dy != 0) {
    desiredAngle = Math.atan2(dx, dy);
  }
  delta.turn = desiredAngle - perspective.currentHeading;
  if (delta.turn > Math.PI) {
    delta.turn -= 2 * Math.PI;
  }
  if (delta.turn < -Math.PI) {
    delta.turn += 2 * Math.PI;
  }
}
