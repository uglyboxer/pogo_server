/*global User, Game, Room, Negotiate, sails*/
/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

"use strict";

module.exports = {

    /**
     * `UserController.signup()`
     */


    subscribe: function (req, res) {
        if (req.isSocket) {
            User.find().exec(function (err, users) {
                if (err) {
                    console.log(err);
                    return res.send(500);
                }
                User.subscribe(req, users);
                User.watch(req);

            });
            Room.find().exec(function (err, rooms) {
                if (err) {
                    console.log(err);
                    return res.send(500);
                }
                Room.subscribe(req, rooms);
                Room.watch(req);
            });

            Negotiate.find({ 'confirmed': false }).exec(function(err, negotiations) {
                Negotiate.subscribe(req, negotiations, ['destroy']);
                Negotiate.watch(req);
                return res.send(200);

            });
        }
    },

    announce: function(req, res) {

        // Get the socket ID from the reauest
        var socketId = sails.sockets.getId(req),
        // Get the session from the request
            session = req.session,
            userId = session.passport.user;
        // User.update({ id: userId }, {loggedIn: true}).exec(function(err, user) {
        //     if (err) return next(err);
        // });
        User.findOne({ id: userId }).exec(function(err, user) {
            sails.config.globals.loggedInUsers[user.id] = {socket: socketId,
                                                           username: user.username,
                                                           id: userId};
            User.publishUpdate(userId, {
                loggedIn: true,
                id: userId,
                username: user.username,
                action: ' has logged in.'
            });
            Game.find({ active: true,
                        or: [{ black: userId },
                             { white: userId }]
                      }).exec(function (err, games) {
                        if (err) {
                          console.log(err);
                          return res.send(500);
                        } else if (games.length > 0) {
                          Game.subscribe(req, games, ['message']);
                          // This only will work for one active game at a time, for now.
                          var game = games[0];
                          return res.send({ user: user,
                                            rejoin: true,
                                            start: true,
                                            gameId: game.id,
                                            moves: game.moves,
                                            boardsize: game.boardsize,
                                            black: game.black });
                        } else {
                          return res.send({ user: user });
                      }
                    });
          });
    },

    online: function(req, res) {
        var users = sails.config.globals.loggedInUsers;
        return res.send(users);
    },

    logout: function(req, res) {
        if (req.isSocket) {
            var userId = req.session.passport.user,
                socketId = sails.sockets.getId(req);
            delete sails.config.globals.loggedInUsers[userId];

            User.publishDestroy(userId, req);
            req.session.destroy();
            req.logout();
        }
    }
};
