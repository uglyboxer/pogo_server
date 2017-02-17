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
      console.log(negotiation);
      params = {
        black: negotiation.black,
        white: negotiation.white,
        handicap: negotiation.handicap,
        timeSettings: ""
      }
      Game.create(params).exec(function(err, game) {
        if (err) return res.send(500);
        console.log(game, ' created');
      })

    }
  };

