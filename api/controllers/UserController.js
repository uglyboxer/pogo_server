/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * `UserController.signup()`
     */


    subscribe: function(req, res) {
        if (req.isSocket) {
            User.find().exec(function(err, users) {
                User.subscribe(req, users);
                User.watch(req);

            });
            Room.find().exec(function(err, rooms) {
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
        var socketId = sails.sockets.getId(req);
        // Get the session from the request
        var session = req.session;
        var userId = session.passport.user;
        User.update({ id: userId }, {loggedIn: true}).exec(function(err, user) {
            if (err) return next(err);
            User.publishUpdate(userId, {
                loggedIn: true,
                id: userId,
                username: user[0].username,
                action: ' has logged in.'
            }, req);  // Don't tell the socket about itself
            return res.send(user[0]);
        });
    },

    online: function(req, res) {
        User.find({loggedIn: true}).exec(function(err, users) {
          console.log('found em, ', users);
        return res.send(users);
        })
    },

    logout: function(req, res) {
        if (req.isSocket) {
            var userId = req.session.passport.user;
            User.update({id: userId}, {loggedIn: false}).exec(function(err){
              if (err) {
                return res.send(500);
              }
            })
            User.publishDestroy(userId, req);
            req.session.destroy();
        }
    }
};
