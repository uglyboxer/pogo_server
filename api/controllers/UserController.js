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
    signup: function(req, res) {
      console.log(req.params.all());
        User.create(req.params.all()).exec(function(err, user) {
            if (err) return res.negotiate(err);
            req.login(user, function(err) {
                if (err) return res.negotiate(err);
                return res.redirect('/');
            });
        });
    },

    subscribe: function(req, res) {
      if (req.isSocket) {
        console.log('do eet dammeet');
      }
      User.find().exec(function(err, users) {
        console.log(users);
        User.subscribe(req, users);
        User.watch(req);
      });
    },

    announce: function(req, res, next) {

        // Get the socket ID from the reauest
        var socketId = sails.sockets.getId(req);
        // Get the session from the request
        var session = req.session;
        var userId = session.passport.user;
        User.findOne({id: userId}, function(err, user) {
          if (err) return next(err);
          User.publishUpdate(userId, {
            loggedIn: true,
            id: userId,
            name: user.name,
            action: ' has logged in.'
          });
        });
        return res.send(200);


    },

    logout: function(req, res) {
              // Get the socket ID from the reauest
        var socketId = sails.sockets.getId(req);
        // Get the session from the request
        var session = req.session;
        var userId = session.passport.user;
        // Create the session.users hash if it doesn't exist already
        session.users = session.users || {};
        // Room.unwatch(req.socket);
        // User.unwatch(req.socket);
        User.publishDestroy(req.socket.id, req.socket);
        console.log(req.socket.id, ' deleted');

    }
};
