/**
 * Define repository model
 */
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Repository = sequelize.define('repositories', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    path: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    openedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, { timestamps: true });

module.exports = Repository;