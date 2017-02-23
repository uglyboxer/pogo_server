"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var VALID_KO_OPTIONS = ["simple", "superko"];

var Ruleset = function Ruleset(_ref) {
  var koRule = _ref.koRule;

  this.koRule = koRule;

  if (VALID_KO_OPTIONS.indexOf(this.koRule) < 0) {
    throw new Error("Unknown ko rule: " + koRule);
  }

  Object.freeze(this);
};

Ruleset.prototype = {
  isIllegal: function isIllegal(y, x, game) {
    var boardState = game.currentState();
    var nextColor = game.currentPlayer();
    var intersection = boardState.intersectionAt(y, x);

    var result = !intersection.isEmpty() || this._wouldBeSuicide(y, x, nextColor, boardState) || this._isKoViolation(y, x, nextColor, boardState, game._moves);

    return result;
  },

  _isKoViolation: function _isKoViolation(y, x, color, boardState, existingStates) {
    var isKoViolation = false;

    if (this.koRule === "simple") {
      var koPoint = boardState.koPoint;
      isKoViolation = koPoint && koPoint.y === y && koPoint.x === x;
    } else {
      (function () {
        var newState = boardState.playAt(y, x, color);
        var boardStates = existingStates;

        isKoViolation = existingStates.length > 0 && boardStates.some(function (existingState) {
          return existingState.positionSameAs(newState);
        });
      })();
    }

    return isKoViolation;
  },

  _wouldBeSuicide: function _wouldBeSuicide(y, x, color, boardState) {
    var intersection = boardState.intersectionAt(y, x);
    var surroundedEmptyPoint = intersection.isEmpty() && boardState.neighborsFor(intersection.y, intersection.x).filter(function (neighbor) {
      return neighbor.isEmpty();
    }).length === 0;

    if (!surroundedEmptyPoint) {
      return false;
    }

    var someFriendlyNotInAtari = boardState.neighborsFor(intersection.y, intersection.x).some(function (neighbor) {
      var inAtari = boardState.inAtari(neighbor.y, neighbor.x);
      var friendly = neighbor.isOccupiedWith(color);

      return friendly && !inAtari;
    });

    if (someFriendlyNotInAtari) {
      return false;
    }

    var someEnemyInAtari = boardState.neighborsFor(intersection.y, intersection.x).some(function (neighbor) {
      var inAtari = boardState.inAtari(neighbor.y, neighbor.x);
      var enemy = !neighbor.isOccupiedWith(color);

      return enemy && inAtari;
    });

    if (someEnemyInAtari) {
      return false;
    }

    return true;
  }
};

exports.default = Ruleset;

//# sourceMappingURL=ruleset.js.map