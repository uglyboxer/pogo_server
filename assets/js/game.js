function initiateGame(data) {
  console.log('Launching board');
  var player = 'black' // get from session and/or data
  var boardElement = document.querySelector(".tenuki-board");
  var client = new tenuki.Client(boardElement);
  client.setup({
    player: player,
    gameOptions: {
            boardSize: 19 //Number(boardSize)
        },
        hooks: {
            submitPlay: function(playedY, playedX, result) {
                io.socket.post('/game/playedAt', { location: [playedX, playedY], gameId: 52 });
                console.log(result);
                result(true); // TODO Have server emit validation instead of just using true
                //  emit('result_of_' + move_number + game_id)

            },

            submitMarkDeadAt: function(y, x, stones, result) {
                // $.post("http://localhost:3000/mark-dead-at", { y: y, x: x }).done(function(data) {
                //     result(data["result"]);
                // }).fail(function() {
                //     result(false);
                // });
            },

            submitPass: function(result) {
            //     $.post("http://localhost:3000/pass").done(function(data) {
            //         result(data["result"]);
            //     }).fail(function() {
            //         result(false);
            //     });
            // }
        }
  }
});
}

function renderMove(data) {
  console.log('Rendering move at: ', data);
}
