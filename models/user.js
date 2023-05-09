'use strict';
const crypto = require('crypto');
const ENCRYPT_KEY = process.env.ENCRYPT_KEY;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    squareId: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    accessToken: {
      type: DataTypes.STRING
    },    
    refreshToken: {
      type: DataTypes.STRING
    },
    tokenExp: {
      type: DataTypes.DATE 
    }
  });
  
  User.encryptToken = function (accessToken) {
    const cipher = crypto.createCipher('aes192', ENCRYPT_KEY);

    let encrypted = cipher.update(accessToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  User.decryptToken = function (accessToken) {
    const decipher = crypto.createDecipher('aes192', ENCRYPT_KEY);

    let decrypted = decipher.update(accessToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  return User;
};