/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    initiate: function(req, res) {
      var tenuki = require('../../lib/tenuki');
      var gameObj = new tenuki.Game();
      var negotiation = req.param('negotiation');
      console.log(negotiation.black, ' is gonna play ', negotiation.white);
      Negotiate.destroy(negotiation.negotiation_id).exec(function(err) {
        if (err) {return res.send(500);}
      });
      Negotiate.publishDestroy(negotiation.negotiation_id);
      console.log(negotiation);
      params = {
        black: negotiation.black.id,
        white: negotiation.white.id,
        handicap: negotiation.handicap,
        timeSettings: "",
        gameState: gameObj
      }
      Game.create(params).exec(function(err, game) {
        if (err) return res.send(500);
        // subscribe the owner of the negotiation
        Game.subscribe(req, game);
        User.message(negotiation.challenger, {start: true, gameId: game.id}, req);
        res.send(200);
      })

    },
    join: function(req, res) {
      // subscribe the challenger to the created game
      var gameId = req.param('gameId');
      Game.subscribe(req, gameId);
      res.send(200);
    },

    playedAt: function(data) {
      var gameId = data.gameId;
      var location = data.location;
      var x = Number(location[0]);
      var y = Number(location[1]);
      var color = data.color;
      Game.findOne({id: gameId}).exec(function(err, game) {
        if (err) return res.send(500);
        var result = game.gameObj.playAt(y, x, color);
      });

    }
  };

