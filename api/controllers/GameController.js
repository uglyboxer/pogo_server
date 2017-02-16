/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    initiate: function(req, res) {
      var negotiation = req.param('negotiation');
      console.log(negotiation.black, ' is gonna play ', negotiation.white);
      Negotiate.destroy(negotiation.negotiation_id).exec(function(err) {
        if (err) {return res.send(500);}
      });
      Negotiate.publishDestroy(negotiation.negotiation_id);
    }
  };

