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
  })
}

function renderMove(data) {
  console.log('Rendering move at: ', data);
}
