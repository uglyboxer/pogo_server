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
                Negotiate.subscribe(req, negotiation.id);
                Negotiate.publishCreate(negotiation);
                return res.send(200);
            })
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

        Negotiate.subscribe(req, negotiationId);
        sails.sockets.join(req, negotiationId);
        Negotiate.update(Number(negotiationId), { challenger: req.session.passport.user }).exec(function afterwards(err, updated) {

            if (err) {
                console.log(err);
                return;
            }
            // TODO Calculate who is black player, who is white
            Negotiate.publishUpdate(negotiationId, {
                negotiation_id: negotiationId,
                owner: updated[0].owner,
                challenger: req.session.passport.user
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
