// Add a selection for an available open game
function addNegotiation(negotiation) {
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

// Open the dialog window to debate the starting rules for a game.
function openNegotiate(data) {
  io.socket.post('/room/'+data+'/users', {id: window.me.id});
  $('#negotiation-window').show();
}

