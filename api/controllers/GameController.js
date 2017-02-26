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

        console.log(negotiation);
        // var defaultParams = {
        //     color: 'black', // handicapStones > 1 ? "black" : "white",
        //     moveNumber: 0,
        //     intersections: [], // Object.freeze(emptyPoints),
        //     blackStonesCaptured: 0,
        //     whiteStonesCaptured: 0,
        //     whitePassStones: 0,
        //     blackPassStones: 0,
        //     boardSize: 19 // variable instead = boardSize
        // }
        // BoardState.create(defaultParams).exec(function(err, state) {

            params = {
                black: negotiation.black.id,
                white: negotiation.white.id,
                handicap: negotiation.handicap,
                timeSettings: "",
                 boardSize: 19, // TODO unhardcode Number(data['boardsize']) })
               scoring: "territory",  // TODO unhardcode
               koRule: "simple",
                // intialState: state,
            }

            Game.create(params).exec(function(err, game) {
                if (err) return res.send(500);

                game.setup({ boardSize: 19, // TODO unhardcode Number(data['boardsize']) })
                             scoring: "territory",  // TODO unhardcode
                             koRule: "simple",
                 });
                // console.log(game.isIllegalAt(2,1), 'outside test');
                // subscribe the owner of the negotiation
                Game.subscribe(req, game, ['message']);
                // TODO publishCreate?  just notify owner....
                console.log('trying to reach ', negotiation.challenger);
                Negotiate.message(negotiation.negotiation_id, { start: true, gameId: game.id }, req);
                // User.message(negotiation.challenger, {start: true, gameId: game.id}, req);
                res.send(200);
                // Negotiate.destroy(negotiation.negotiation_id).exec(function(err) {
                //   if (err) {return res.send(500);}
                // });
                // Negotiate.publishDestroy(negotiation.negotiation_id);
            });
        // })
    },
    join: function(req, res) {
        // subscribe the challenger to the created game
        var gameId = req.param('gameId');
        console.log(req.session.passport.user, ' joined game ', gameId);
        Game.subscribe(req, gameId, ['message']);
        Game.message(gameId, { start: true });
        res.send(200);
    },

    playedAt: function(req, res) {
        console.log(req.params.all());
        var data = req.params.all();
        var gameId = data.gameId;
        var location = data.location;
        var x = Number(location[0]);
        var y = Number(location[1]);
        var color = 'black'; // TODO get this from session variable
        // TODO 2-22 Replace db call with global array LIVE_GAMES = {}
        // Keyed by gameId
        Game.findOne({ id: gameId }).exec(function(err, game) {
            if (err) return res.send(500);
            console.log('found game: ', game);
            var result = game.playAt(y, x);
            console.log(result);
            return res.send(200);
        });

    }
};
