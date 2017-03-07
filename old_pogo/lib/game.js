"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _domRenderer = require("./dom-renderer");

var _domRenderer2 = _interopRequireDefault(_domRenderer);

var _svgRenderer = require("./svg-renderer");

var _svgRenderer2 = _interopRequireDefault(_svgRenderer);

var _nullRenderer = require("./null-renderer");

var _nullRenderer2 = _interopRequireDefault(_nullRenderer);

var _boardState = require("./board-state");

var _boardState2 = _interopRequireDefault(_boardState);

var _ruleset = require("./ruleset");

var _ruleset2 = _interopRequireDefault(_ruleset);

var _scorer = require("./scorer");

var _scorer2 = _interopRequireDefault(_scorer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VALID_GAME_OPTIONS = ["boardSize", "scoring", "handicapStones", "koRule", "komi", "_hooks", "fuzzyStonePlacement", "renderer", "freeHandicapPlacement"];

var Game = function Game(boardElement) {
  this._defaultBoardSize = 19;
  this.boardSize = null;
  this._moves = [];
  this.callbacks = {
    postRender: function postRender() {}
  };
  this._boardElement = boardElement;
  this._defaultScoring = "territory";
  this._defaultKoRule = "simple";
  this._defaultRenderer = "svg";
  this._deadPoints = [];
};

Game.prototype = {
  _configureOptions: function _configureOptions() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$boardSize = _ref.boardSize,
        boardSize = _ref$boardSize === undefined ? this._defaultBoardSize : _ref$boardSize,
        _ref$komi = _ref.komi,
        komi = _ref$komi === undefined ? 0 : _ref$komi,
        _ref$handicapStones = _ref.handicapStones,
        handicapStones = _ref$handicapStones === undefined ? 0 : _ref$handicapStones,
        _ref$freeHandicapPlac = _ref.freeHandicapPlacement,
        freeHandicapPlacement = _ref$freeHandicapPlac === undefined ? false : _ref$freeHandicapPlac,
        _ref$scoring = _ref.scoring,
        scoring = _ref$scoring === undefined ? this._defaultScoring : _ref$scoring,
        _ref$koRule = _ref.koRule,
        koRule = _ref$koRule === undefined ? this._defaultKoRule : _ref$koRule,
        _ref$renderer = _ref.renderer,
        renderer = _ref$renderer === undefined ? this._defaultRenderer : _ref$renderer;

    if (typeof boardSize !== "number") {
      throw new Error("Board size must be a number, but was: " + (typeof boardSize === "undefined" ? "undefined" : _typeof(boardSize)));
    }

    if (typeof handicapStones !== "number") {
      throw new Error("Handicap stones must be a number, but was: " + (typeof boardSize === "undefined" ? "undefined" : _typeof(boardSize)));
    }

    if (handicapStones > 0 && boardSize !== 9 && boardSize !== 13 && boardSize !== 19) {
      throw new Error("Handicap stones not supported on sizes other than 9x9, 13x13 and 19x19");
    }

    if (handicapStones < 0 || handicapStones === 1 || handicapStones > 9) {
      throw new Error("Only 2 to 9 handicap stones are supported");
    }

    if (boardSize > 19) {
      throw new Error("cannot generate a board size greater than 19");
    }

    this.boardSize = boardSize;
    this.handicapStones = handicapStones;
    this._freeHandicapPlacement = freeHandicapPlacement;

    this._scorer = new _scorer2.default({
      scoreBy: scoring,
      komi: komi
    });

    this._rendererChoice = {
      "dom": _domRenderer2.default,
      "svg": _svgRenderer2.default
    }[renderer];

    if (!this._rendererChoice) {
      throw new Error("Unknown renderer: " + renderer);
    }

    this._whiteMustPassLast = this._scorer.usingPassStones();

    this._ruleset = new _ruleset2.default({
      koRule: koRule
    });

    if (this._freeHandicapPlacement) {
      this._initialState = _boardState2.default._initialFor(boardSize, 0);
    } else {
      this._initialState = _boardState2.default._initialFor(boardSize, handicapStones);
    }
  },

  _stillPlayingHandicapStones: function _stillPlayingHandicapStones() {
    return this._freeHandicapPlacement && this.handicapStones > 0 && this._moves.length < this.handicapStones;
  },

  setup: function setup() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    for (var key in options) {
      if (options.hasOwnProperty(key) && VALID_GAME_OPTIONS.indexOf(key) < 0) {
        throw new Error("Unrecognized game option: " + key);
      }
    }

    this._configureOptions(options);

    if (this._boardElement) {
      var defaultRendererHooks = {
        handleClick: function handleClick(y, x) {
          if (_this.isOver()) {
            _this.toggleDeadAt(y, x);
          } else {
            _this.playAt(y, x);
          }
        },

        hoverValue: function hoverValue(y, x) {
          if (!_this.isOver() && !_this.isIllegalAt(y, x)) {
            return _this.currentPlayer();
          }
        },

        gameIsOver: function gameIsOver() {
          return _this.isOver();
        }
      };

      this.renderer = new this._rendererChoice(this._boardElement, {
        hooks: options["_hooks"] || defaultRendererHooks,
        options: {
          fuzzyStonePlacement: options["fuzzyStonePlacement"]
        }
      });
    } else {
      this.renderer = new _nullRenderer2.default();
    }

    this.render();
  },

  intersectionAt: function intersectionAt(y, x) {
    return this.currentState().intersectionAt(y, x);
  },

  intersections: function intersections() {
    return this.currentState().intersections;
  },

  deadStones: function deadStones() {
    return this._deadPoints;
  },

  coordinatesFor: function coordinatesFor(y, x) {
    return this.currentState().xCoordinateFor(x) + this.currentState().yCoordinateFor(y);
  },

  currentPlayer: function currentPlayer() {
    if (this._stillPlayingHandicapStones()) {
      return "black";
    }

    var lastMoveColor = this.currentState().color;

    if (lastMoveColor === "black") {
      return "white";
    } else {
      return "black";
    }
  },

  isWhitePlaying: function isWhitePlaying() {
    return this.currentPlayer() === "white";
  },

  isBlackPlaying: function isBlackPlaying() {
    return this.currentPlayer() === "black";
  },

  score: function score() {
    return this._scorer.score(this);
  },

  currentState: function currentState() {
    return this._moves[this._moves.length - 1] || this._initialState;
  },

  moveNumber: function moveNumber() {
    return this.currentState().moveNumber;
  },

  playAt: function playAt(y, x) {
    if (this.isIllegalAt(y, x)) {
      return false;
    }

    var newState = this.currentState().playAt(y, x, this.currentPlayer());
    this._moves.push(newState);

    this.render();

    return true;
  },

  pass: function pass() {
    if (this.isOver()) {
      return false;
    }

    var newState = this.currentState().playPass(this.currentPlayer());
    this._moves.push(newState);

    this.render();

    return true;
  },

  isOver: function isOver() {
    if (this._moves.length < 2) {
      return false;
    }

    if (this._whiteMustPassLast) {
      var finalMove = this._moves[this._moves.length - 1];
      var previousMove = this._moves[this._moves.length - 2];

      return finalMove.pass && previousMove.pass && finalMove.color === "white";
    } else {
      var _finalMove = this._moves[this._moves.length - 1];
      var _previousMove = this._moves[this._moves.length - 2];

      return _finalMove.pass && _previousMove.pass;
    }
  },

  toggleDeadAt: function toggleDeadAt(y, x) {
    var _this2 = this;

    if (this.intersectionAt(y, x).isEmpty()) {
      return;
    }

    var alreadyDead = this._isDeadAt(y, x);

    this.currentState().groupAt(y, x).forEach(function (intersection) {
      if (alreadyDead) {
        _this2._deadPoints = _this2._deadPoints.filter(function (dead) {
          return !(dead.y === intersection.y && dead.x === intersection.x);
        });
      } else {
        _this2._deadPoints.push({ y: intersection.y, x: intersection.x });
      }
    });

    this.render();

    return true;
  },

  _isDeadAt: function _isDeadAt(y, x) {
    return this._deadPoints.some(function (dead) {
      return dead.y === y && dead.x === x;
    });
  },

  isIllegalAt: function isIllegalAt(y, x) {
    return this._ruleset.isIllegal(y, x, this);
  },

  territory: function territory() {
    if (!this.isOver()) {
      return {
        black: [],
        white: []
      };
    }

    return this._scorer.territory(this);
  },

  undo: function undo() {
    this._moves.pop();
    this.render();
  },

  render: function render() {
    if (!this.isOver()) {
      this._deadPoints = [];
    }

    this.renderer.render(this.currentState(), {
      territory: this.territory(),
      deadStones: this.deadStones()
    });

    this.callbacks.postRender(this);
  }
};

exports.default = Game;

//# sourceMappingURL=game.js.map