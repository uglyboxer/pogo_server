"use strict";

module.exports = function(sequelize, DataTypes) {
  var Account = sequelize.define("account", {
    accountID: DataTypes.UUID,
    userName: DataTypes.STRING,
    lastOnline: DataTypes.DATE,
    password: DataTypes.STRING,
    wins: DataTypes.INTEGER,
    losses: DataTypes.INTEGER,
    rank: DataTypes.FLOAT
    // date created and date updated are automatically generated
  }, {
    classMethods: {
      associate: function(models) {
        Account.hasMany(models.game_record, {as: 'games'});
      }
    }
  });

  return Account;
};