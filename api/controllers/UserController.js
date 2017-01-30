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
      Room.find().exec(function(err, rooms) {
        console.log(rooms);
        Room.subscribe(req, rooms);
        Room.watch(req);


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
        return res.send(user);
        });


    },

    online: function(req, res) {
      return res.send(sails.config.globals.LOGGED_IN_USERS)
    },

    logout: function(req, res) {
        if (req.isSocket) {
          console.log('I guess');
        }
        var userId = req.session.passport.user
        User.publishDestroy(userId, req);
        delete sails.config.globals.LOGGED_IN_USERS[userId];
        console.log(req.socket.id, ' deleted');

    }
};
