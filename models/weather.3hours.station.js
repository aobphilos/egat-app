const { DataTypes } = require('sequelize');

const Weather3HoursStationSchema = {
  name: 'weather_3hours_station',
  define: {
    wmoStationNumber: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    stationNameThai: DataTypes.STRING,
    stationNameEnglish: DataTypes.STRING,
    province: DataTypes.STRING,
    latitude: DataTypes.DECIMAL,
    longitude: DataTypes.DECIMAL,
  },
  options: {
    timestamps: false,
    indexes: [{ unique: true, fields: ['wmoStationNumber'] }],
  },
};

module.exports = Weather3HoursStationSchema;
