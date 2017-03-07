"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _intersection = require("./intersection");

var _intersection2 = _interopRequireDefault(_intersection);

var _zobrist = require("./zobrist");

var _zobrist2 = _interopRequireDefault(_zobrist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BoardState = function BoardState(_ref) {
  var moveNumber = _ref.moveNumber,
      playedPoint = _ref.playedPoint,
      color = _ref.color,
      pass = _ref.pass,
      blackPassStones = _ref.blackPassStones,
      whitePassStones = _ref.whitePassStones,
      intersections = _ref.intersections,
      blackStonesCaptured = _ref.blackStonesCaptured,
      whiteStonesCaptured = _ref.whiteStonesCaptured,
      capturedPositions = _ref.capturedPositions,
      koPoint = _ref.koPoint,
      boardSize = _ref.boardSize;

  this.moveNumber = moveNumber;
  this.playedPoint = playedPoint;
  this.color = color;
  this.pass = pass;
  this.blackPassStones = blackPassStones;
  this.whitePassStones = whitePassStones;
  this.intersections = intersections;
  this.blackStonesCaptured = blackStonesCaptured;
  this.whiteStonesCaptured = whiteStonesCaptured;
  this.capturedPositions = capturedPositions;
  this.koPoint = koPoint;
  this.boardSize = boardSize;
  this._positionHash = _zobrist2.default.hash(boardSize, intersections);

  Object.freeze(this);
};

BoardState.prototype = {
  _capturesFrom: function _capturesFrom(y, x, color) {
    var _this = this;

    var capturedNeighbors = this.neighborsFor(y, x).filter(function (neighbor) {
      // TODO: this value of 1 is potentially weird.
      // we're checking against the move before the stone we just played
      // where this space is not occupied yet. things should possibly be
      // reworked.
      return !neighbor.isEmpty() && neighbor.value !== color && _this.libertiesAt(neighbor.y, neighbor.x) === 1;
    });

    var capturedStones = _utils2.default.flatMap(capturedNeighbors, function (neighbor) {
      return _this.groupAt(neighbor.y, neighbor.x);
    });

    return _utils2.default.unique(capturedStones);
  },

  _updateIntersection: function _updateIntersection(intersection, intersections, color) {
    return intersections.map(function (i) {
      if (i.y === intersection.y && i.x === intersection.x) {
        return new _intersection2.default(i.y, i.x, color);
      } else {
        return i;
      }
    });
  },

  _removeIntersection: function _removeIntersection(intersection, intersections) {
    return this._updateIntersection(intersection, intersections, "empty");
  },

  _withoutIntersectionsMatching: function _withoutIntersectionsMatching(condition) {
    var newPoints = this.intersections.map(function (i) {
      if (condition(i)) {
        return new _intersection2.default(i.y, i.x, "empty");
      } else {
        return i;
      }
    });

    return this._withNewPoints(newPoints);
  },

  _withNewPoints: function _withNewPoints(newPoints) {
    var newState = new BoardState({
      moveNumber: this.moveNumber,
      playedPoint: this.playedPoint,
      color: this.color,
      pass: this.pass,
      blackPassStones: this.blackPassStones,
      whitePassStones: this.whitePassStones,
      intersections: newPoints,
      blackStonesCaptured: this.blackStonesCaptured,
      whiteStonesCaptured: this.whiteStonesCaptured,
      capturedPositions: this.capturedPositions,
      koPoint: this.koPoint,
      boardSize: this.boardSize
    });

    return newState;
  },

  yCoordinateFor: function yCoordinateFor(y) {
    return this.boardSize - y;
  },

  xCoordinateFor: function xCoordinateFor(x) {
    var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

    return letters[x];
  },

  playPass: function playPass(color) {
    var stateInfo = {
      moveNumber: this.moveNumber + 1,
      playedPoint: null,
      color: color,
      pass: true,
      blackPassStones: this.blackPassStones,
      whitePassStones: this.whitePassStones,
      intersections: this.intersections,
      blackStonesCaptured: this.blackStonesCaptured,
      whiteStonesCaptured: this.whiteStonesCaptured,
      capturedPositions: [],
      koPoint: null,
      boardSize: this.boardSize
    };

    stateInfo[color + "PassStones"] += 1;

    var newState = new BoardState(stateInfo);

    return newState;
  },

  playAt: function playAt(y, x, playedColor) {
    var _this2 = this;

    var capturedPositions = this._capturesFrom(y, x, playedColor);
    var playedPoint = this.intersectionAt(y, x);
    var newPoints = this.intersections;

    capturedPositions.forEach(function (i) {
      newPoints = _this2._removeIntersection(i, newPoints);
    });

    newPoints = this._updateIntersection(playedPoint, newPoints, playedColor);

    var newTotalBlackCaptured = this.blackStonesCaptured + (playedColor === "black" ? 0 : capturedPositions.length);
    var newTotalWhiteCaptured = this.whiteStonesCaptured + (playedColor === "white" ? 0 : capturedPositions.length);

    var boardSize = this.boardSize;

    var moveInfo = {
      moveNumber: this.moveNumber + 1,
      playedPoint: playedPoint,
      color: playedColor,
      pass: false,
      blackPassStones: this.blackPassStones,
      whitePassStones: this.whitePassStones,
      intersections: newPoints,
      blackStonesCaptured: newTotalBlackCaptured,
      whiteStonesCaptured: newTotalWhiteCaptured,
      capturedPositions: capturedPositions,
      boardSize: boardSize
    };

    var withPlayedPoint = new BoardState(moveInfo);
    var hasKoPoint = capturedPositions.length === 1 && withPlayedPoint.groupAt(y, x).length === 1 && withPlayedPoint.inAtari(y, x);

    if (hasKoPoint) {
      moveInfo["koPoint"] = { y: capturedPositions[0].y, x: capturedPositions[0].x };
    } else {
      moveInfo["koPoint"] = null;
    }

    return new BoardState(moveInfo);
  },

  intersectionAt: function intersectionAt(y, x) {
    return this.intersections[y * this.boardSize + x];
  },

  groupAt: function groupAt(y, x) {
    var startingPoint = this.intersectionAt(y, x);

    var _partitionTraverse = this.partitionTraverse(startingPoint, function (neighbor) {
      return neighbor.sameColorAs(startingPoint);
    }),
        _partitionTraverse2 = _slicedToArray(_partitionTraverse, 2),
        group = _partitionTraverse2[0],
        _ = _partitionTraverse2[1];

    return group;
  },

  libertiesAt: function libertiesAt(y, x) {
    var _this3 = this;

    var point = this.intersectionAt(y, x);

    var emptyPoints = _utils2.default.flatMap(this.groupAt(point.y, point.x), function (groupPoint) {
      return _this3.neighborsFor(groupPoint.y, groupPoint.x).filter(function (intersection) {
        return intersection.isEmpty();
      });
    });

    return _utils2.default.unique(emptyPoints).length;
  },

  inAtari: function inAtari(y, x) {
    return this.libertiesAt(y, x) === 1;
  },

  neighborsFor: function neighborsFor(y, x) {
    var neighbors = [];

    if (x > 0) {
      neighbors.push(this.intersectionAt(y, x - 1));
    }

    if (x < this.boardSize - 1) {
      neighbors.push(this.intersectionAt(y, x + 1));
    }

    if (y > 0) {
      neighbors.push(this.intersectionAt(y - 1, x));
    }

    if (y < this.boardSize - 1) {
      neighbors.push(this.intersectionAt(y + 1, x));
    }

    return neighbors;
  },

  positionSameAs: function positionSameAs(otherState) {
    return this._positionHash === otherState._positionHash && this.intersections.every(function (point) {
      return point.sameColorAs(otherState.intersectionAt(point.y, point.x));
    });
  },

  // Iterative depth-first search traversal. Start from
  // startingPoint, iteratively follow all neighbors.
  // If inclusionConditionis met for a neighbor, include it
  // otherwise, exclude it. At the end, return two arrays:
  // One for the included neighbors, another for the remaining neighbors.
  partitionTraverse: function partitionTraverse(startingPoint, inclusionCondition) {
    var checkedPoints = [];
    var boundaryPoints = [];
    var pointsToCheck = [];

    pointsToCheck.push(startingPoint);

    while (pointsToCheck.length > 0) {
      var point = pointsToCheck.pop();

      if (checkedPoints.indexOf(point) > -1) {
        // skip it, we already checked
      } else {
        checkedPoints.push(point);

        this.neighborsFor(point.y, point.x).forEach(function (neighbor) {
          if (checkedPoints.indexOf(neighbor) > -1) {
            // skip this neighbor, we already checked it
          } else {
            if (inclusionCondition(neighbor)) {
              pointsToCheck.push(neighbor);
            } else {
              boundaryPoints.push(neighbor);
            }
          }
        });
      }
    }

    return [checkedPoints, _utils2.default.unique(boundaryPoints)];
  }
};

BoardState._initialFor = function (boardSize, handicapStones) {
  this._cache = this._cache || {};
  this._cache[boardSize] = this._cache[boardSize] || {};

  if (this._cache[boardSize][handicapStones]) {
    return this._cache[boardSize][handicapStones];
  }

  var emptyPoints = Array.apply(null, Array(boardSize * boardSize));
  emptyPoints = emptyPoints.map(function (x, i) {
    return new _intersection2.default(Math.floor(i / boardSize), i % boardSize);
  });

  var hoshiOffset = boardSize > 11 ? 3 : 2;
  var hoshiPoints = {
    topRight: { y: hoshiOffset, x: boardSize - hoshiOffset - 1 },
    bottomLeft: { y: boardSize - hoshiOffset - 1, x: hoshiOffset },
    bottomRight: { y: boardSize - hoshiOffset - 1, x: boardSize - hoshiOffset - 1 },
    topLeft: { y: hoshiOffset, x: hoshiOffset },
    middle: { y: (boardSize + 1) / 2 - 1, x: (boardSize + 1) / 2 - 1 },
    middleLeft: { y: (boardSize + 1) / 2 - 1, x: hoshiOffset },
    middleRight: { y: (boardSize + 1) / 2 - 1, x: boardSize - hoshiOffset - 1 },
    middleTop: { y: hoshiOffset, x: (boardSize + 1) / 2 - 1 },
    middleBottom: { y: boardSize - hoshiOffset - 1, x: (boardSize + 1) / 2 - 1 }
  };
  var handicapPlacements = {
    0: [],
    1: [],
    2: [hoshiPoints.topRight, hoshiPoints.bottomLeft],
    3: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight],
    4: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight, hoshiPoints.topLeft],
    5: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight, hoshiPoints.topLeft, hoshiPoints.middle],
    6: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight, hoshiPoints.topLeft, hoshiPoints.middleLeft, hoshiPoints.middleRight],
    7: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight, hoshiPoints.topLeft, hoshiPoints.middleLeft, hoshiPoints.middleRight, hoshiPoints.middle],
    8: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight, hoshiPoints.topLeft, hoshiPoints.middleLeft, hoshiPoints.middleRight, hoshiPoints.middleTop, hoshiPoints.middleBottom],
    9: [hoshiPoints.topRight, hoshiPoints.bottomLeft, hoshiPoints.bottomRight, hoshiPoints.topLeft, hoshiPoints.middleLeft, hoshiPoints.middleRight, hoshiPoints.middleTop, hoshiPoints.middleBottom, hoshiPoints.middle]
  };

  handicapPlacements[handicapStones].forEach(function (p) {
    emptyPoints[p.y * boardSize + p.x] = new _intersection2.default(p.y, p.x, "black");
  });

  var initialState = new BoardState({
    color: handicapStones > 1 ? "black" : "white",
    moveNumber: 0,
    intersections: Object.freeze(emptyPoints),
    blackStonesCaptured: 0,
    whiteStonesCaptured: 0,
    whitePassStones: 0,
    blackPassStones: 0,
    boardSize: boardSize
  });

  this._cache[boardSize][handicapStones] = initialState;
  return initialState;
};

exports.default = BoardState;

//# sourceMappingURL=board-state.js.map