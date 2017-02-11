// Add a selection for an available open game
function addNegotiation(negotiation) {
  console.log(negotiation);
  // Get a handle to the negotiation list <select> element
  var negotiations = $('#negotiation-list');
  // Create a new <option> for the <select> with the new negotiation's information
  var option = $('<button onclick="openNegotiate('+ negotiation.id + ')" id="'+"negotiation-"+negotiation.id+'" value="'+negotiation.id+'">game'+negotiation.id+'</button><br>');

  // Add the new <option> element
  negotiations.append(option);
}

function removeNegotiation(negotiationId) {
  $('#negotiation-'+negotiationId).remove();
}

function updateOpenNegotiations(negotiations) {
  negotiations.forEach(addNegotiation);

}

function showNegotiation(data) {
  $('#negotiation-window').show();
  $('#black-player-name').empty()
  $('#black-player-name').text(data.black.username);
  $('#white-player-name').empty()
  $('#white-player-name').text(data.white.username);
  if (data.owner === window.me.id) {
    $('.approve-buttons').show()
    // TODO activate buttons or maybe just reverify on server that owner is sending accept
  }
}
// Open the dialog window to debate the starting rules for a game.
function openNegotiate(data) {
  io.socket.post('/negotiate/join', {id: window.me.id, negotiationId: data}, function(resData, jwres){
    console.log(jwres.statusCode);
  });
}

