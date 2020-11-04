const { DataTypes, Deferrable } = require('sequelize');

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
    stationPressure: DataTypes.DECIMAL,
    meanSeaLevelPressure: DataTypes.DECIMAL,
    airTemperature: DataTypes.DECIMAL,
    dewPoint: DataTypes.DECIMAL,
    relativeHumidity: DataTypes.DECIMAL,
    vaporPressure: DataTypes.DECIMAL,
    landVisibility: DataTypes.DECIMAL,
    windDirection: DataTypes.INTEGER,
    windSpeed: DataTypes.DECIMAL,
    rainfall: DataTypes.DECIMAL,
    rainfall24Hr: DataTypes.DECIMAL,
  },
  options: {
    timestamps: false,
    indexes: [{ unique: true, fields: ['dateTime', 'wmoStationNumber'] }],
  },
};

module.exports = Weather3HoursObservationSchema;
