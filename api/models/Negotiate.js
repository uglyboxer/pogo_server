/**
 * Negotiate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autosubscribe: ['destroy', 'update', 'add:users', 'remove:users'],
    attributes: {
        owner: {
            model: 'user'
        },
        challenger: {
            collection: 'user',
        },
        board_size: {
            type: 'integer',
            defaultsTo: 19
        },
        komi: {
            type: 'float',
            defaultsTo: 6.5
        },
        time_system: 'integer',
        time_limit: 'string',
        suggestion: 'json',
        confirmed: {
            type: 'boolean',
            defaultsTo: false
        }
    }
};
