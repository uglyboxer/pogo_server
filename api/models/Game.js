/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    black: {
      model: 'User',
      via: 'games'
    },

    white: {
      model: 'User',
      via: 'games'
    },
    handicap: { type: 'float',
                defaultsTo: 6.5 },

    timeSettings: { type: 'string', // TODO make this a fk to model with options
                    defaultsTo: 'Count if it means that much to you'},

    moves: { type: 'array' },

    gameState: { type: 'json' },

    blackCaptured: { type: 'integer',
                     defaultsTo: 0 },

    whiteCaptured: { type: 'integer',
                     defaultsTo: 0 },

    result: { type: 'string' },

    dateStarted: { type: 'datetime' },
    dateFinished: { type: 'datetime' }

  }
};

