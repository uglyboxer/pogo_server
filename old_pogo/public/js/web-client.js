;
var doc = document;
var socket = io.connect('//localhost:3000');
var client;
var player;
var currentRoom;
var boardReady = false;
socket.on('roomList', function(data) {
    var roomList = doc.getElementById('room-list');
    while (roomList.firstChild) {
        roomList.removeChild(roomList.lastChild);
    }

    for (var roomName in data) {
        if (data.hasOwnProperty(roomName)) {
            var roomItem = doc.createElement('li');
            var roomLink = doc.createElement('a');
            var roomText = doc.createTextNode(roomName);
            roomLink.appendChild(roomText);
            roomLink.addEventListener('click', joinRoom, false);
            roomItem.appendChild(roomLink)
            roomList.appendChild(roomItem);
        }

    }
});

socket.on('joined', function(data) {
    currentRoom = data;
    console.log(currentRoom);
    socket.emit('refresh', { room: currentRoom })
});

socket.on('refresh_state', function(data) {
    for (var i = 0; i < data.length; i++) {
        var x = data[i]['playedPoint']['x'];
        var y = data[i]['playedPoint']['y'];
        client.receivePlay(y, x);
    }
    boardReady = true;
});

socket.on('game_state', function(data) {
    console.log(data);
    if ($.isEmptyObject(data)) {
        return;
    }
    console.log('moves:', data['moveNumber'], client.moveNumber());
    // if (data["moveNumber"] === client.moveNumber() + 1) {
    if (data["pass"]) {
        client.receivePass();
    } else {
        if (boardReady || player != 'viewer') {
            client.receivePlay(data["y"], data["x"]);
        }
    }
    // }

    if (data["phase"] === "scoring") {
        client.setDeadStones(data["deadStones"]);
    }
});

function joinRoom(e) {
    var room = e.target.text;
    initGame(false);
    socket.emit('ask_to_join', { 'room': room });
    console.log(room);
}

function initGame(createGame) {

    var boardSize = $('#board-size').val();
    var boardElement = doc.querySelector(".tenuki-board");
    player = $('#color').val();

    if (createGame) {
        socket.emit('new_game', { boardsize: boardSize });
    }
    client = new tenuki.Client(boardElement);
    client.setup({
        player: player,
        gameOptions: {
            boardSize: Number(boardSize)
        },
        hooks: {
            submitPlay: function(playedY, playedX, result) {
                socket.emit('played_at', { location: [playedX, playedY], room: currentRoom });
                console.log(result);
                result(true); // TODO Have server emit validation instead of just using true
                //  emit('result_of_' + move_number + game_id)

            },

            submitMarkDeadAt: function(y, x, stones, result) {
                $.post("http://localhost:3000/mark-dead-at", { y: y, x: x }).done(function(data) {
                    result(data["result"]);
                }).fail(function() {
                    result(false);
                });
            },

            submitPass: function(result) {
                $.post("http://localhost:3000/pass").done(function(data) {
                    result(data["result"]);
                }).fail(function() {
                    result(false);
                });
            }
        }
    });
    var controlElement = document.querySelector(".controls");
    var game = client._game;
    var controls = new ExampleGameControls(controlElement, game);
    controls.setup();
}