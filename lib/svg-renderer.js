"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

var _renderer = require("./renderer");

var _renderer2 = _interopRequireDefault(_renderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SVGRenderer = function SVGRenderer(boardElement, _ref) {
  var hooks = _ref.hooks,
      options = _ref.options;

  _renderer2.default.call(this, boardElement, { hooks: hooks, options: options });
  _utils2.default.addClass(boardElement, "tenuki-svg-renderer");
};

SVGRenderer.prototype = Object.create(_renderer2.default.prototype);
SVGRenderer.prototype.constructor = SVGRenderer;

SVGRenderer.prototype.generateBoard = function (boardState) {
  var _this = this;

  var renderer = this;
  var zoomContainer = renderer.zoomContainer;

  var svg = _utils2.default.createSVGElement("svg");
  renderer.svgElement = svg;

  var defs = _utils2.default.createSVGElement("defs");
  _utils2.default.appendElement(svg, defs);

  renderer.blackGradientID = _utils2.default.randomID("black-gradient");
  renderer.whiteGradientID = _utils2.default.randomID("white-gradient");

  var blackGradient = _utils2.default.createSVGElement("radialGradient", {
    attributes: {
      id: renderer.blackGradientID,
      cy: "0",
      r: "55%"
    }
  });
  _utils2.default.appendElement(blackGradient, _utils2.default.createSVGElement("stop", {
    attributes: {
      offset: "0%",
      "stop-color": "#848484"
    }
  }));
  _utils2.default.appendElement(blackGradient, _utils2.default.createSVGElement("stop", {
    attributes: {
      offset: "100%",
      "stop-color": "hsl(0, 0%, 20%)"
    }
  }));
  _utils2.default.appendElement(defs, blackGradient);

  var whiteGradient = _utils2.default.createSVGElement("radialGradient", {
    attributes: {
      id: renderer.whiteGradientID,
      cy: "0",
      r: "70%"
    }
  });
  _utils2.default.appendElement(whiteGradient, _utils2.default.createSVGElement("stop", {
    attributes: {
      offset: "0%",
      "stop-color": "white"
    }
  }));
  _utils2.default.appendElement(whiteGradient, _utils2.default.createSVGElement("stop", {
    attributes: {
      offset: "100%",
      "stop-color": "#DDDDDD"
    }
  }));
  _utils2.default.appendElement(defs, whiteGradient);

  var contentsContainer = _utils2.default.createSVGElement("g", {
    attributes: {
      class: "contents",
      transform: "translate(" + this.MARGIN + ", " + this.MARGIN + ")"
    }
  });

  var lines = _utils2.default.createSVGElement("g", {
    attributes: {
      class: "lines"
    }
  });
  _utils2.default.appendElement(contentsContainer, lines);

  for (var y = 0; y < boardState.boardSize - 1; y++) {
    for (var x = 0; x < boardState.boardSize - 1; x++) {
      var lineBox = _utils2.default.createSVGElement("rect", {
        attributes: {
          y: y * (this.INTERSECTION_GAP_SIZE + 1) - 0.5,
          x: x * (this.INTERSECTION_GAP_SIZE + 1) - 0.5,
          width: this.INTERSECTION_GAP_SIZE + 1,
          height: this.INTERSECTION_GAP_SIZE + 1,
          class: "line-box"
        }
      });

      _utils2.default.appendElement(lines, lineBox);
    }
  }

  var hoshiPoints = _utils2.default.createSVGElement("g", { attributes: { class: "hoshi" } });
  _utils2.default.appendElement(contentsContainer, hoshiPoints);

  _renderer2.default.hoshiPositionsFor(boardState.boardSize).forEach(function (h) {
    var hoshi = _utils2.default.createSVGElement("circle", {
      attributes: {
        class: "hoshi",
        cy: h.top * (_this.INTERSECTION_GAP_SIZE + 1) - 0.5,
        cx: h.left * (_this.INTERSECTION_GAP_SIZE + 1) - 0.5,
        r: 2
      }
    });

    _utils2.default.appendElement(hoshiPoints, hoshi);
  });

  var intersections = _utils2.default.createSVGElement("g", { attributes: { class: "intersections" } });
  _utils2.default.appendElement(contentsContainer, intersections);

  if (this.hasCoordinates) {
    (function () {
      var coordinateContainer = _utils2.default.createSVGElement("g", {
        attributes: {
          class: "coordinates",
          transform: "translate(" + _this.MARGIN + ", " + _this.MARGIN + ")"
        }
      });

      var _loop = function _loop(_y) {
        if (_this.hasCoordinates) {
          // TODO: 16 is for the rendered height _on my browser_. not reliable...

          [16 / 2 + 1 - (16 + 16 / 2 + 16 / (2 * 2) + 16 / (2 * 2 * 2)), 16 / 2 + 1 + (16 + 16 / 2) + (boardState.boardSize - 1) * (_this.INTERSECTION_GAP_SIZE + 1)].forEach(function (verticalOffset) {
            _utils2.default.appendElement(coordinateContainer, _utils2.default.createSVGElement("text", {
              text: boardState.xCoordinateFor(_y),
              attributes: {
                "text-anchor": "middle",
                y: verticalOffset - 0.5,
                x: _y * (_this.INTERSECTION_GAP_SIZE + 1) - 0.5
              }
            }));
          });

          [-1 * (16 + 16 / 2 + 16 / (2 * 2)), 16 + 16 / 2 + 16 / (2 * 2) + (boardState.boardSize - 1) * (_this.INTERSECTION_GAP_SIZE + 1)].forEach(function (horizontalOffset) {
            _utils2.default.appendElement(coordinateContainer, _utils2.default.createSVGElement("text", {
              text: boardState.yCoordinateFor(_y),
              attributes: {
                "text-anchor": "middle",
                y: _y * (_this.INTERSECTION_GAP_SIZE + 1) - 0.5 + 16 / (2 * 2),
                x: horizontalOffset - 0.5
              }
            }));
          });

          _utils2.default.appendElement(svg, coordinateContainer);
        }
      };

      for (var _y = 0; _y < boardState.boardSize; _y++) {
        _loop(_y);
      }
    })();
  }

  for (var _y2 = 0; _y2 < boardState.boardSize; _y2++) {
    for (var _x = 0; _x < boardState.boardSize; _x++) {
      var intersectionGroup = _utils2.default.createSVGElement("g", {
        attributes: {
          class: "intersection"
        }
      });
      _utils2.default.appendElement(intersections, intersectionGroup);

      var intersectionInnerContainer = _utils2.default.createSVGElement("g", {
        attributes: {
          class: "intersection-inner-container"
        }
      });
      _utils2.default.appendElement(intersectionGroup, intersectionInnerContainer);

      var intersectionBox = _utils2.default.createSVGElement("rect", {
        attributes: {
          y: _y2 * (this.INTERSECTION_GAP_SIZE + 1) - this.INTERSECTION_GAP_SIZE / 2 - 0.5,
          x: _x * (this.INTERSECTION_GAP_SIZE + 1) - this.INTERSECTION_GAP_SIZE / 2 - 0.5,
          width: this.INTERSECTION_GAP_SIZE,
          height: this.INTERSECTION_GAP_SIZE
        }
      });
      _utils2.default.appendElement(intersectionInnerContainer, intersectionBox);

      var stoneRadius = this.INTERSECTION_GAP_SIZE / 2;

      if (this.smallerStones) {
        stoneRadius -= 1;
      }

      var stoneAttributes = {
        class: "stone",
        cy: _y2 * (this.INTERSECTION_GAP_SIZE + 1) - 0.5,
        cx: _x * (this.INTERSECTION_GAP_SIZE + 1) - 0.5,
        width: this.INTERSECTION_GAP_SIZE + 1,
        height: this.INTERSECTION_GAP_SIZE + 1,
        r: stoneRadius
      };

      if (this.texturedStones) {
        _utils2.default.appendElement(intersectionInnerContainer, _utils2.default.createSVGElement("circle", {
          attributes: {
            class: "stone-shadow",
            cy: stoneAttributes["cy"] + 2,
            cx: stoneAttributes["cx"],
            width: stoneAttributes["width"],
            height: stoneAttributes["height"],
            r: stoneRadius
          }
        }));
      }

      var intersection = _utils2.default.createSVGElement("circle", {
        attributes: stoneAttributes
      });
      _utils2.default.appendElement(intersectionInnerContainer, intersection);

      _utils2.default.appendElement(intersectionInnerContainer, _utils2.default.createSVGElement("circle", {
        attributes: {
          class: "marker",
          cy: _y2 * (this.INTERSECTION_GAP_SIZE + 1) - 0.5,
          cx: _x * (this.INTERSECTION_GAP_SIZE + 1) - 0.5,
          width: this.INTERSECTION_GAP_SIZE + 1,
          height: this.INTERSECTION_GAP_SIZE + 1,
          r: 4.5
        }
      }));

      _utils2.default.appendElement(intersectionInnerContainer, _utils2.default.createSVGElement("rect", {
        attributes: {
          class: "ko-marker",
          y: _y2 * (this.INTERSECTION_GAP_SIZE + 1) - 6 - 0.5,
          x: _x * (this.INTERSECTION_GAP_SIZE + 1) - 6 - 0.5,
          width: 12,
          height: 12
        }
      }));

      _utils2.default.appendElement(intersectionInnerContainer, _utils2.default.createSVGElement("rect", {
        attributes: {
          class: "territory-marker",
          y: _y2 * (this.INTERSECTION_GAP_SIZE + 1) - 6,
          x: _x * (this.INTERSECTION_GAP_SIZE + 1) - 6,
          width: 11,
          height: 11
        }
      }));

      this.grid[_y2] = this.grid[_y2] || [];
      this.grid[_y2][_x] = intersectionGroup;

      this.addIntersectionEventListeners(intersectionGroup, _y2, _x);
    }
  }

  _utils2.default.appendElement(svg, contentsContainer);
  _utils2.default.appendElement(zoomContainer, svg);

  renderer.svgElement.setAttribute("height", renderer.BOARD_LENGTH);
  renderer.svgElement.setAttribute("width", renderer.BOARD_LENGTH);
};

SVGRenderer.prototype.computeSizing = function () {
  var _this2 = this;

  _renderer2.default.prototype.computeSizing.call(this);

  // In addition to the will-change re-raster in Renderer,
  // the SVG element appears to sometimes need this to
  // prevent blurriness on resize.
  this.svgElement.style.transform = "none";

  window.requestAnimationFrame(function () {
    _this2.svgElement.style.transform = "";
  });
};

SVGRenderer.prototype.setIntersectionClasses = function (intersectionEl, intersection, classes) {
  if (intersectionEl.getAttribute("class") !== classes.join(" ")) {
    intersectionEl.setAttribute("class", classes.join(" "));
  }

  if (this.texturedStones) {
    if (intersection.isEmpty()) {
      intersectionEl.querySelector(".stone").setAttribute("style", "");
    } else {
      intersectionEl.querySelector(".stone").setAttribute("style", "fill: url(#" + this[intersection.value + "GradientID"] + ")");
    }
  }
};

exports.default = SVGRenderer;

//# sourceMappingURL=svg-renderer.js.map