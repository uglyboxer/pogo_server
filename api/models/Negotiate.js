/**
 * Negotiate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autosubscribe: ['destroy', 'update'],
    attributes: {
        black_player: {
            collection: 'user',
        },
        white_player: {
            collection: 'user',
        },
        board_size: 'integer',
        komi: 'integer',
        time_system: 'integer',
        time_limit: 'string',
        confirmed: 'boolean'
    }
};
