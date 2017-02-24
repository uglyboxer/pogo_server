/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        black: {
            model: 'User',
            via: 'games'
        },

        white: {
            model: 'User',
            via: 'games'
        },
        handicap: {
            type: 'float',
            defaultsTo: 6.5
        },

        timeSettings: {
            type: 'string', // TODO make this a fk to model with options
            defaultsTo: 'Count if it means that much to you'
        },

        initialState: {
            model: 'BoardState',
            via: 'game'
        },

        moves: { type: 'array' },

        deadPoints: { type: 'array' },

        gameState: { type: 'json' },

        blackCaptured: {
            type: 'integer',
            defaultsTo: 0
        },

        whiteCaptured: {
            type: 'integer',
            defaultsTo: 0
        },

        result: { type: 'string' },

        dateStarted: { type: 'datetime' },
        dateFinished: { type: 'datetime' },

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

            this.currentState().groupAt(y, x).forEach(function(intersection) {
                if (alreadyDead) {
                    _this2._deadPoints = _this2._deadPoints.filter(function(dead) {
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
            return this._deadPoints.some(function(dead) {
                return dead.y === y && dead.x === x;
            });
        },

        isIllegalAt: function isIllegalAt(y, x) {
            var Ruleset = require('../../lib/ruleset').default;
            var ruleset = new Ruleset({
              koRule: 'simple'  // koRule should be var
            });
            return ruleset.isIllegal(y, x, this);
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
        }
    }


};
