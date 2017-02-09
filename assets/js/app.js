/**
 * app.js
 *
 * Front-end code and event handling for sailsChat
 *
 */


// Attach a listener which fires when a connection is established:
io.socket.on('connect', function socketConnected() {
    // Show the main UI
    $('#disconnect').hide();
    $('#main').show();

    // Announce that a new user is online--in this somewhat contrived example,
    // this also causes the CREATION of the user, so each window/tab is a new user.
    io.socket.get("/user/subscribe", function(data) {
    });

    io.socket.get("/user/announce", function(data) {
        window.me = data;
        // updateMyName(data);

        // Get the current list of users online.  This will also subscribe us to
        // update and destroy events for the individual users.

        // Get the current list of chat rooms. This will also subscribe us to
        // update and destroy events for the individual rooms.

        io.socket.get('/user/online', updateUserList);
        io.socket.get('/room', updateRoomList);
        io.socket.get('/negotiate/open', updateOpenNegotiations);
    });

    // Listen for the "room" event, which will be broadcast when something
    // happens to a room we're subscribed to.  See the "autosubscribe" attribute
    // of the Room model to see which messages will be broadcast by default
    // to subscribed sockets.
    io.socket.on('room', function messageReceived(message) {

        switch (message.verb) {

            // Handle room creation
            case 'created':
                addRoom(message.data);
                break;

                // Handle a user joining a room
            case 'addedTo':
                // Post a message in the room
                postStatusMessage('room-messages-' + message.id, $('#user-' + message.addedId).text() + ' has joined');
                // Update the room user count
                increaseRoomCount(message.id);
                break;

                // Handle a user leaving a room
            case 'removedFrom':
                // Post a message in the room
                postStatusMessage('room-messages-' + message.id, $('#user-' + message.removedId).text() + ' has left');
                // Update the room user count
                decreaseRoomCount(message.id);
                break;

                // Handle a room being destroyed
            case 'destroyed':
                removeRoom(message.id);
                break;

                // Handle a public message in a room.  Only sockets subscribed to the "message" context of a
                // Room instance will get this message--see the "join" and "leave" methods of RoomController.js
                // to see where a socket gets subscribed to a Room instance's "message" context.
            case 'messaged':
                receiveRoomMessage(message.data);
                break;

            default:
                break;

        }

    });

    // Listen for the "user" event, which will be broadcast when something
    // happens to a user we're subscribed to.  See the "autosubscribe" attribute
    // of the User model to see which messages will be broadcast by default
    // to subscribed sockets.
    io.socket.on('user', function messageReceived(message) {
        console.log(message);
        switch (message.verb) {

            // Handle user creation
            case 'created':
                // addUser(message.data);
                break;

                // Handle a user changing their name
            case 'updated':

                // Get the user's old name by finding the <option> in the list with their ID
                // and getting its text.
                addUser(message.data);
                var oldName = $('#user-' + message.id).text();

                // Update the name in the user select list
                $('#user-' + message.id).text(message.data.name);

                // If we have a private convo with them, update the name there and post a status message in the chat.
                if ($('#private-username-' + message.id).length) {
                    $('#private-username-' + message.id).html(message.data.name);
                    postStatusMessage('private-messages-' + message.id, oldName + ' has changed their name to ' + message.data.name);
                }

                break;

                // Handle user destruction
            case 'destroyed':
                removeUser(message.id);
                break;

                // Handle private messages.  Only sockets subscribed to the "message" context of a
                // User instance will get this message--see the onConnect logic in config/sockets.js
                // to see where a new user gets subscribed to their own "message" context
            case 'messaged':
                receivePrivateMessage(message.data);
                break;

            default:
                break;
        }

    });

    io.socket.on('negotiate', function messageReceived(message) {
      console.log('stuff', message);
      switch (message.verb) {
                    // Handle negotiation creation
            case 'created':
                addNegotiation(message.data);
                break;

                // Handle a user changing their name
            case 'updated':

                // Get the user's old name by finding the <option> in the list with their ID
                // and getting its text.
                console.log(message.data, ' would like to play.');
                break;

                // Handle user destruction
            case 'destroyed':
                console.log(message);
                removeNegotiation(message.id);
                break;

                // Handle a user joining a room
            case 'addedTo':
                // Post a message in the room
                postNegotiationStatusMessage('-messages-' + message.id, $('#user-' + message.addedId).text() + ' has joined');
                break;

                // Handle a user leaving a room
            case 'removedFrom':
                // Post a message in the room if party leaves
                postNegotiationStatusMessage('room-messages-' + message.id, $('#user-' + message.removedId).text() + ' has left');
                break;

                // Handle a public message in a room.  Only sockets subscribed to the "message" context of a
                // Room instance will get this message--see the "join" and "leave" methods of RoomController.js
                // to see where a socket gets subscribed to a Room instance's "message" context.
            case 'messaged':
                receiveNogtiationMessage(message.data);
                break;

            default:
                break;

        }
    })

    // Add a click handler for the "Update name" button, allowing the user to update their name.
    // updateName() is defined in user.js.
    $('#update-name').click(updateName);

    // Add a click handler for the "Send private message" button
    // startPrivateConversation() is defined in private_message.js.
    $('#private-msg-button').click(startPrivateConversation);

    // Add a click handler for the "Join room" button
    // joinRoom() is defined in public_message.js.
    $('#join-room').click(joinRoom);

    // Add a click handler for the "New room" button
    // newRoom() is defined in room.js.
    $('#new-room').click(newRoom);

    $('#logout').click(function() {
        io.socket.get('/user/logout');
        window.location.href = '/';
    })

    $('#start-negotiation').click(function() {
        $('#dialog').show();
    });

    $('#dialog-form').submit(function(event) {
        event.preventDefault();
        $('#owner').val(window.me.id);
        var data = {};
        $('#dialog-form').serializeArray().map(function(x){data[x.name] = x.value;});
        // data['owner'] = window.me.id;
        // TODO, this doesn't work right
        io.socket.post('/negotiate/create', data, function(resdata, jwres) {
          addNegotiation(resdata);
        });

    });

    console.log('Socket is now connected!');

    // When the socket disconnects, hide the UI until we reconnect.
    io.socket.on('disconnect', function() {
        // Hide the main UI
        $('#main').hide();
        $('#disconnect').show();
    });

});
