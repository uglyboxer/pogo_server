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
                console.log('hi, ',negotiation);
                Negotiate.subscribe(req, negotiation.id, ['message']);
            })
        }
    },

    open: function(req, res) {
        Negotiate.find({ 'confirmed': false }).exec(function(err, negotiations) {

            return res.send(negotiations);
        });
    },

    // Join a negotiation room -- this is bound to 'post /negotiate/:roomId/users'
    'join': function(req, res, next) {
        // Get the ID of the room to join
        console.log(req);
        // TODO set param name to below
        var negotiationId = req.param('negotiationId');
        // Subscribe the requesting socket to the "message" context,
        // so it'll get notified whenever Room.message() is called
        // for this room.
        Negotiate.subscribe(req, negotiationId, ['message']);
        Negotiate.publishAdd(negotiatonId, 'users', {
          id: req.session.passport.user,

        })
        // Continue processing the route, allowing the blueprint
        // to handle adding the user instance to the room's `users`
        // collection.
        // Negotiate.findOne({id: negotiationId}).exec(function(err, negotiation) {
        //   console.log(negotiation);
        //   console.log(negotiation.challenger);
        //   if (!negotiation.challenger) {
        //     negotiation.update({'challenger': req.session.passport.user}).exec(function(err, next) {
        //       if (err) {
        //         return err;
        //       } else {
        //         console.log(negotiation);
        //         Negotiate.publishUpdate(negotiation);
        //         return next();
        //       }
        //     })
        //   }
        // })
        return next();
    },

    // Leave a chat room -- this is bound to 'delete /room/:roomId/users'
    'leave': function(req, res, next) {
        // Get the ID of the room to join
        // TODO set param name to below
        var negotiationId = req.param('negotiationId');
        // Unsubscribe the requesting socket from the "message" context
        Negotiate.unsubscribe(req, negotiationId, ['message']);
        // Continue processing the route, allowing the blueprint
        // to handle removing the user instance from the room's
        // `users` collection.
        return next();
    }

};
