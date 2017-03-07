"use strict";

module.exports = function(sequelize, DataTypes) {
    var GameRecord = sequelize.define("game_record", {
        room: DataTypes.STRING,
        dateFinished: DataTypes.DATE,  // Date Created generated automatically, serves as start
        moves: DataTypes.JSONB,
        result: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                GameRecord.belongsTo(models.account, { as: 'black' })
            },
            associate: function(models) {
                GameRecord.belongsTo(models.account, { as: 'white' })
            }

        }
    });

    return GameRecord;
};
