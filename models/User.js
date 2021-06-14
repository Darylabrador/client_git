/**
 * Define user model
 */
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {timestamps: true})

module.exports = User;