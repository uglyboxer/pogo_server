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

    announce: function(req, res) {

        // Get the socket ID from the reauest
        var socketId = sails.sockets.getId(req);
        // Get the session from the request
        var session = req.session;
        var userId = session.passport.user;
        // Create the session.users hash if it doesn't exist already
        session.users = session.users || {};
        // User.create({
        User.findOne({ id: userId }).exec(function(err, user) {
            if (err) {
                return res.serverError(err);
            }

            // Save this user in the session, indexed by their socket ID.
            // This way we can look the user up by socket ID later.
            session.users[socketId] = user;

            // Subscribe the connected socket to custom messages regarding the user.
            // While any socket subscribed to the user will receive messages about the
            // user changing their name or being destroyed, ONLY this particular socket
            // will receive "message" events.  This allows us to send private messages
            // between users.
            User.subscribe(req, user, 'message');

            //     // Get updates about users being created
            User.watch(req);

            //     // Get updates about rooms being created
            Room.watch(req);

            //     // Publish this user creation event to every socket watching the User model via User.watch()
            User.publishCreate(user, req);

            return res.json(user);

        });

    }
};
