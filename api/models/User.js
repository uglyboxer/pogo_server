/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');

module.exports = {

    attributes: {
        username: {
            type: 'string'
        },
        email: {
            type: 'string',
            // required: true,
            unique: true
        },
        password: {
            type: 'string',
            minLength: 2,
            required: true
        },
        rank: {
            type: 'integer',
            default: 30
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        },

        rooms: {
            collection: 'room',
            via: 'users',
            dominant: true
        },

        negotiations: {
            collection: 'negotiate',
            via: 'owner',
        },

        signup: {
            type: 'string'
        }
    },
    beforeCreate: function(user, cb) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    user.password = hash;
                    cb();
                }
            });
        });
    },
    // Hook that gets called after the default publishUpdate is run.
    // We'll use this to tell all public chat rooms about the user update.
    afterPublishUpdate: function(id, changes, req, options) {

        // Get the full user model, including what rooms they're subscribed to
        User.findOne(id).populate('rooms').exec(function(err, user) {
            // Publish a message to each room they're in.  Any socket that is
            // subscribed to the room will get the message. Saying it's "from" id:0
            // will indicate to the front-end code that this is a systen message
            // (as opposed to a message from a user)
            sails.util.each(user.rooms, function(room) {
                var previousName = options.previous.name == 'unknown' ? 'User #' + id : options.previous.name;
                Room.message(room.id, {
                    room: {
                        id: room.id
                    },
                    from: {
                        id: 0
                    },
                    msg: previousName + " changed their name to " + changes.name
                }, req);
            });

        });

    }
};
