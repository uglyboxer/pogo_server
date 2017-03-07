'use strict';

var User = function (userId){
    this.userId = userId;
    this.socketID = "";
    this.memberInRooms = [];
}

User.prototype = {
   leaveRoom: function leaveRoom(socket, room) {
       socket.leave(room);
   },
   joinRoom: function joinRoom(socket, room) {
        sockect.join(room);
   }
}
module.exports = User;