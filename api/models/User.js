var User = {
    // Enforce model schema in the case of schemaless databases
    schema: true,

    attributes: {
        username: { type: 'string', unique: true },
        email: { type: 'email', unique: true },
        passports: { collection: 'Passport', via: 'user' },
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
    },
};

module.exports = User;
