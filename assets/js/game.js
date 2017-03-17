/*global window,
         document,
         io,
         tenuki*/
"use strict";

function initiateGame(data) {
    console.log('Launching board');
    var player = window.me.color,
        activeColor = window.me.activeColor,
        boardElement = document.querySelector(".tenuki-board"),
        controlElement = document.querySelector(".controls"),
        client = new tenuki.Client(boardElement);
    client.setup({
        player: player,
        gameOptions: {
            boardSize: data.boardsize // TODO from data (not currently sent): Number(boardSize)
        },
        hooks: {
            submitPlay: function (playedY, playedX, result) {
                io.socket.post('/game/playedAt', { location: [playedX, playedY], gameId: data.gameId });
                console.log(result);
                result(true); // TODO Have server emit validation instead of just using true
                //  emit('result_of_' + move_number + game_id)

            },

            submitMarkDeadAt: function (y, x, stones, result) {
                io.socket.post('/game/markDeadAt', { location: [y, x], stones: stones, gameId: data.gameId });
                result(true); // TODO Fix the hardcode
                // $.post("http://localhost:3000/mark-dead-at", { y: y, x: x }).done(function(data) {
                //     result(data["result"]);
                // }).fail(function() {
                //     result(false);
                // });
            },

            submitPass: function (result) {
                io.socket.post('/game/pass', { gameId: data.gameId });
                console.log(result);
                // result(true);
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
    window.me.controls = new ExampleGameControls(controlElement, client._game);
    window.me.controls.setup();
}

function renderMove(data) {
    console.log('Rendering move at: ', data);
    var client = window.me.client,
        y = data.playedY,
        x = data.playedX;
    console.log('current busy status: ', client._busy);
    client.receivePlay(y, x);
    window.me.controls.updateStats();
}

function renderPass() {
    var client = window.me.client;
    client.receivePass();
    window.me.controls.updateStats();
    console.log(client._game.isOver());
}

function renderToggleDead(location) {
    var client = window.me.client;
    var y = location[0],
        x = location[1];
    client._game.hooks.handleClick(y, x);
    // TODO make sure this ins't cycling back to server again
    window.me.controls.updateStats();
    console.log(client._game.isOver());
}
