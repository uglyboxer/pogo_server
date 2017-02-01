/**
 * NegotiateController
 *
 * @description :: Server-side logic for managing Negotiates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    create: function(req, res) {
        Negotiate.create(req.params.all()).exec(function(err, negotiation) {
            if (err) return res.negotiate(err);
            Negotiate.publishCreate(negotiation);
            // res.send(200);
        })
    },

    open: function(req, res) {
        Negotiate.find({ 'confirmed': false }).exec(function(err, negotiations) {

            return res.send(negotiations);
        });
    }
};
