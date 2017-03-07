function initiateGame(data) {
    console.log('Launching board');
    var player = window.me.color;
    var activeColor = window.me.activeColor;
    var boardElement = document.querySelector(".tenuki-board");
    var client = new tenuki.Client(boardElement);
    client.setup({
        player: player,
        gameOptions: {
            boardSize: data.boardsize // TODO from data (not currently sent): Number(boardSize)
        },
        hooks: {
            submitPlay: function(playedY, playedX, result) {
                io.socket.post('/game/playedAt', { location: [playedX, playedY], gameId: data.gameId });
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
              io.socket.post('/game/pass', { gameId: data.gameId });
                console.log(result);
                result(true);
                //     $.post("http://localhost:3000/pass").done(function(data) {
                //         result(data["result"]);
                //     }).fail(function() {
                //         result(false);
                //     });
                // }
            }
        }
    });
    window.me.client = client;
}

function renderMove(data) {
    console.log('Rendering move at: ', data);
    var client = window.me.client;
    var y = data['playedY'];
    var x = data['playedX'];
    client.receivePlay(y, x);
}

function renderPass() {
    var client = window.me.client;
    client.receivePass();
}

// Gonna do this in example-controls (rename) instead
// function submitPass() {
//     var client = window.me.client;
//     client.hooks.submitPass();
// }
