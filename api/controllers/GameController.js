/*global Game, Negotiate*/
"use strict";
/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var games = {};
module.exports = {

    initiate: function(req, res) {
        var negotiation = req.param('negotiation'),
            // TODO should get this from database based on id, not from user
            params = {
                black: negotiation.black.id,
                white: negotiation.white.id,
                handicap: negotiation.handicap,
                timeSettings: "",
                boardsize: Number(negotiation.boardsize), // TODO unhardcode Number(data['boardsize']) })
            };

        Game.create(params).exec(function (err, game) {
            if (err) {
                return res.send(500);
            }

            game.setup({
                boardSize: params['boardsize'], // TODO unhardcode Number(data['boardsize']) })
                scoring: "territory", // TODO unhardcode
                koRule: "simple",
            });
            games[String(game.id)] = game;
            // subscribe the owner of the negotiation
            Game.subscribe(req, game, ['message']);
            // TODO publishCreate?  just notify owner....
            // TODO leave below in until sure only one game happening per negotiation
            console.log('trying to reach ', negotiation.challenger, ' with game ', game.id);
            console.log(params.boardsize, 'prolly undefined');
            Negotiate.message(negotiation.negotiation_id, { start: true, gameId: game.id, boardsize: params.boardsize }, req);
            // User.message(negotiation.challenger, {start: true, gameId: game.id}, req);
            res.send(200);
            // TODO handle below
            // Negotiate.destroy(negotiation.negotiation_id).exec(function(err) {
            //   if (err) {return res.send(500);}
            // });
            // Negotiate.publishDestroy(negotiation.negotiation_id);
        });
        // })
    },
    join: function (req, res) {
        // subscribe the challenger to the created game
        var gameId = req.param('gameId');
        Game.subscribe(req, gameId, ['message']);
        Game.findOne({ id: gameId }).exec(function (err, game) {
            if (err) {
                return res.send(500);
            }
            console.log('sending ... ', game.black);
            Game.message(gameId, { start: true, gameId: gameId, black: game.black, boardsize: game.boardsize });
        });
        res.send(200);
    },

    playedAt: function (req, res) {
        var data = req.params.all(),
            gameId = data.gameId,
            location = data.location,
            x = Number(location[0]),
            y = Number(location[1]);
            console.log(data, 'rejoing player');
        Game.findOne({ id: gameId }).exec(function (err, gameRecord) {
            if (err) {
                return res.send(500);
            }
            var game = games[String(gameRecord.id)],
                result = game.playAt(y, x);
            if (result) {
                gameRecord.moves.push(location);
                gameRecord.gameState = game.currentState();
                // TODO update each field
                gameRecord.save();
                Game.message(gameId, { gameId: gameId, location: { playedY: y, playedX: x } }, req);
                return res.send(200);
            }
            return res.send(500);
        });

    },
    markDeadAt: function (req, res) {
        var data = req.params.all(),
            gameId = data.gameId,
            location = data.location,
            x = Number(location[0]),
            y = Number(location[1]),
            stones = data.stones;
        Game.findOne({ id: gameId }).exec(function (err, gameRecord) {
            if (err) {
                return res.send(500);
            }
            var game = games[String(gameRecord.id)];
            game.toggleDeadAt(y, x);
            // TODO When both players mark some dead, the game will flip back to alive, need to validate agreement
            if (true) { // TODO true shoud instead be result fo toggleDead function
                gameRecord.moves.push(location);
                gameRecord.gameState = game.currentState();
                // TODO update each field
                gameRecord.save();
                Game.message(gameId, { gameId: gameId, toggleDead: true, location: { playedY: y, playedX: x } }, req);
                return res.send(200);
            }
            return res.send(500);
        });

    },
    pass: function(req, res) {
        var data = req.params.all(),
            gameId = data.gameId;
        Game.findOne({ id: gameId }).exec(function (err, gameRecord) {
            if (err) {
                return res.send(500);
            }
            var game = games[String(gameRecord.id)],
                result = game.pass();
            if (result) {
                gameRecord.moves.push("p");
                gameRecord.gameState = game.currentState();
                // TODO update each field
                gameRecord.save();
                Game.message(gameId, { gameId: gameId, pass: true }, req)
                return res.send(200);
            }
            return res.send(500);
        });

    },
};
