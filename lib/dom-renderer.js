"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _renderer = require("./renderer");

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DOMRenderer = function DOMRenderer(boardElement, _ref) {
  var hooks = _ref.hooks,
      options = _ref.options;

  _renderer2.default.call(this, boardElement, { hooks: hooks, options: options });

  if (this.smallerStones) {
    _utils2.default.addClass(boardElement, "tenuki-smaller-stones");
  }

  _utils2.default.addClass(boardElement, "tenuki-dom-renderer");
};

DOMRenderer.prototype = Object.create(_renderer2.default.prototype);
DOMRenderer.prototype.constructor = DOMRenderer;

DOMRenderer.prototype._setup = function (boardState) {
  _renderer2.default.prototype._setup.call(this, boardState);

  this.BOARD_LENGTH += 1;
  this.computeSizing();
};

DOMRenderer.prototype.generateBoard = function (boardState) {
  var renderer = this;
  var boardElement = this.boardElement;
  var zoomContainer = renderer.zoomContainer;

  _utils2.default.appendElement(zoomContainer, _utils2.default.createElement("div", { class: "lines horizontal" }));
  _utils2.default.appendElement(zoomContainer, _utils2.default.createElement("div", { class: "lines vertical" }));
  _utils2.default.appendElement(zoomContainer, _utils2.default.createElement("div", { class: "hoshi-points" }));
  _utils2.default.appendElement(zoomContainer, _utils2.default.createElement("div", { class: "intersections" }));

  _renderer2.default.hoshiPositionsFor(boardState.boardSize).forEach(function (h) {
    var hoshi = _utils2.default.createElement("div", { class: "hoshi" });
    hoshi.style.left = h.left * (renderer.INTERSECTION_GAP_SIZE + 1) + "px";
    hoshi.style.top = h.top * (renderer.INTERSECTION_GAP_SIZE + 1) + "px";

    _utils2.default.appendElement(boardElement.querySelector(".hoshi-points"), hoshi);
  });

  for (var y = 0; y < boardState.boardSize; y++) {
    var horizontalLine = _utils2.default.createElement("div", { class: "line horizontal" });
    horizontalLine.setAttribute("data-left-gutter", boardState.yCoordinateFor(y));
    _utils2.default.appendElement(boardElement.querySelector(".lines.horizontal"), horizontalLine);

    var verticalLine = _utils2.default.createElement("div", { class: "line vertical" });
    verticalLine.setAttribute("data-top-gutter", boardState.xCoordinateFor(y));
    _utils2.default.appendElement(boardElement.querySelector(".lines.vertical"), verticalLine);

    for (var x = 0; x < boardState.boardSize; x++) {
      var intersectionElement = _utils2.default.createElement("div", { class: "intersection empty" });
      var stoneElement = _utils2.default.createElement("div", { class: "stone" });
      _utils2.default.appendElement(intersectionElement, stoneElement);

      intersectionElement.setAttribute("data-position-x", x);
      intersectionElement.setAttribute("data-position-y", y);

      intersectionElement.style.left = x * (renderer.INTERSECTION_GAP_SIZE + 1) + "px";
      intersectionElement.style.top = y * (renderer.INTERSECTION_GAP_SIZE + 1) + "px";

      _utils2.default.appendElement(boardElement.querySelector(".intersections"), intersectionElement);

      renderer.grid[y] = renderer.grid[y] || [];
      renderer.grid[y][x] = intersectionElement;

      this.addIntersectionEventListeners(intersectionElement, y, x);
    }
  }

  // prevent the text-selection cursor
  _utils2.default.addEventListener(boardElement.querySelector(".lines.horizontal"), "mousedown", function (e) {
    e.preventDefault();
  });
  _utils2.default.addEventListener(boardElement.querySelector(".lines.vertical"), "mousedown", function (e) {
    e.preventDefault();
  });

  boardElement.querySelector(".lines.horizontal").style.width = renderer.INTERSECTION_GAP_SIZE * (boardState.boardSize - 1) + boardState.boardSize + "px";
  boardElement.querySelector(".lines.horizontal").style.height = renderer.INTERSECTION_GAP_SIZE * (boardState.boardSize - 1) + boardState.boardSize + "px";
  boardElement.querySelector(".lines.vertical").style.width = renderer.INTERSECTION_GAP_SIZE * (boardState.boardSize - 1) + boardState.boardSize + "px";
  boardElement.querySelector(".lines.vertical").style.height = renderer.INTERSECTION_GAP_SIZE * (boardState.boardSize - 1) + boardState.boardSize + "px";
};

DOMRenderer.prototype.setIntersectionClasses = function (intersectionEl, intersection, classes) {
  if (intersectionEl.className !== classes.join(" ")) {
    intersectionEl.className = classes.join(" ");
  }
};

exports.default = DOMRenderer;

//# sourceMappingURL=dom-renderer.js.map