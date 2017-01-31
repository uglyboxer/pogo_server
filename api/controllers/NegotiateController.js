/**
 * NegotiateController
 *
 * @description :: Server-side logic for managing Negotiates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  	create: function(req, res) {
      console.log(req);
      Negotiate.create(req.params.all()).exec(function(err, negotiaion) {
        if (err) return res.negotiate(err);
        res.send(200);
      })
    }
};

