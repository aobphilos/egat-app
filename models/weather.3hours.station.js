const _ = require('lodash');
const { DataTypes } = require('sequelize');

function validateDecimal(value, name) {
  const validData = _.toNumber(value);
  this.setDataValue(name, _.isNaN(validData) ? 0 : validData);
}

const Weather3HoursStationSchema = {
  name: 'weather_3hours_station',
  define: {
    wmoStationNumber: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    stationNameThai: DataTypes.STRING,
    stationNameEnglish: DataTypes.STRING,
    province: DataTypes.STRING,
    latitude: { type: DataTypes.DECIMAL, set: validateDecimal },
    longitude: { type: DataTypes.DECIMAL, set: validateDecimal },
  },
  options: {
    timestamps: false,
    indexes: [{ unique: true, fields: ['wmoStationNumber'] }],
  },
};

module.exports = Weather3HoursStationSchema;
