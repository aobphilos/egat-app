const _ = require('lodash');
const { DataTypes, Deferrable } = require('sequelize');

function validateInteger(value, name) {
  const validData = _.toInteger(value);
  this.setDataValue(name, _.isNaN(validData) ? 0 : validData);
}

function validateDecimal(value, name) {
  const validData = _.toNumber(value);
  this.setDataValue(name, _.isNaN(validData) ? 0 : validData);
}

const Weather3HoursObservationSchema = {
  name: 'weather_3hours_observation',
  define: {
    dateTime: {
      type: DataTypes.DATE,
      unique: 'compositeIndex',
      primaryKey: true,
    },
    wmoStationNumber: {
      type: DataTypes.INTEGER,
      unique: 'compositeIndex',
      primaryKey: true,
      references: {
        // This is a reference to another model
        model: 'weather_3hours_stations',

        // This is the column name of the referenced model
        key: 'wmoStationNumber',

        // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
        // Options:
        // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
        // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
        // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
      },
    },

    stationPressure: { type: DataTypes.DECIMAL, set: validateDecimal },
    meanSeaLevelPressure: { type: DataTypes.DECIMAL, set: validateDecimal },
    airTemperature: { type: DataTypes.DECIMAL, set: validateDecimal },
    dewPoint: { type: DataTypes.DECIMAL, set: validateDecimal },
    relativeHumidity: { type: DataTypes.DECIMAL, set: validateDecimal },
    vaporPressure: { type: DataTypes.DECIMAL, set: validateDecimal },
    landVisibility: { type: DataTypes.DECIMAL, set: validateDecimal },
    windDirection: { type: DataTypes.INTEGER, set: validateInteger },
    windSpeed: { type: DataTypes.DECIMAL, set: validateDecimal },
    rainfall: { type: DataTypes.DECIMAL, set: validateDecimal },
    rainfall24Hr: { type: DataTypes.DECIMAL, set: validateDecimal },
  },
  options: {
    timestamps: false,
    indexes: [{ unique: true, fields: ['dateTime', 'wmoStationNumber'] }],
  },
};

module.exports = Weather3HoursObservationSchema;
