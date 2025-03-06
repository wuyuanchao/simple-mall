const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  siteName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '简单商城'
  },
  siteDescription: {
    type: DataTypes.TEXT
  },
  logo: {
    type: DataTypes.STRING
  },
  contactPhone: {
    type: DataTypes.STRING
  },
  contactEmail: {
    type: DataTypes.STRING
  }
});

module.exports = Setting;