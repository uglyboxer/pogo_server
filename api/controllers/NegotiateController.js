/**
 * NegotiateController
 *
 * @description :: Server-side logic for managing Negotiates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: function(req, res) {
        if (req.param('owner') == req.session.passport.user) {
            Negotiate.create(req.params.all()).exec(function(err, negotiation) {
                if (err) return res.negotiate(err);
                console.log('hi, ', negotiation);
                Negotiate.subscribe(req, negotiation.id, ['message']);
                Negotiate.publishCreate(negotiation);
                return res.send(200);
            })
        } else {
          return res.send(500);
        }
    },

    open: function(req, res) {
        Negotiate.find({ 'confirmed': false }).exec(function(err, negotiations) {

            return res.send(negotiations);
        });
    },

    // Join a negotiation room -- this is bound to 'post /negotiate/:roomId/users'
    join: function(req, res) {
        // Get the ID of the room to join
        // TODO set param name to below
        var negotiationId = Number(req.param('negotiationId'));
        // Subscribe the requesting socket to the "message" context,
        // so it'll get notified whenever Room.message() is called
        // for this room.

        Negotiate.subscribe(req, negotiationId, ['message']);
        // sails.sockets.join(req, negotiationId);
        User.findOne({ id: req.session.passport.user }).exec(function(err, user) {

            Negotiate.update(Number(negotiationId), { challenger: req.session.passport.user }).exec(function afterwards(err, updated) {
                var higherRank;
                var lowerRank;

                User.find({ 'id': updated[0].owner }).exec(function(err, owners) {
                    var owner = owners[0];
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (user.rank < owner.rank) {
                        higherRank = user;
                        lowerRank = owner;

                    } else {
                        higherRank = owner;
                        lowerRank = user;
                    }
                    Negotiate.publishUpdate(negotiationId, {
                        negotiation_id: negotiationId,
                        owner: owner.id,
                        black: lowerRank,
                        white: higherRank,
                        challenger: req.session.passport.user
                    });
                });

            });
        });

        return res.send(200);
    },

    // Leave a chat room -- this is bound to 'delete /room/:roomId/users'
    'leave': function(req, res, next) {
        // Get the ID of the room to join
        // TODO set param name to below
        var negotiationId = req.param('negotiationId');
        // Unsubscribe the requesting socket from the "message" context
        Negotiate.unsubscribe(req, negotiationId);
        // Continue processing the route, allowing the blueprint
        // to handle removing the user instance from the room's
        // `users` collection.
        return next();
    }

};
