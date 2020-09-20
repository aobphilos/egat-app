const { DataTypes, Deferrable } = require('sequelize');

const MeterLoadProfileSchema = {
  name: 'meter_load_profile',
  define: {
    // It is possible to create foreign keys:
    initialName: {
      type: DataTypes.STRING,
      unique: 'compositeIndex',
      primaryKey: true,
      references: {
        // This is a reference to another model
        model: 'plants',

        // This is the column name of the referenced model
        key: 'ppInitial',

        // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
        deferrable: Deferrable.INITIALLY_IMMEDIATE,
        // Options:
        // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
        // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
        // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
      },
    },
    timeStamp: { type: DataTypes.DATE, unique: 'compositeIndex', primaryKey: true },
    value: DataTypes.DECIMAL,
  },
  options: {
    timestamps: false,
    indexes: [{ unique: true, fields: ['initialName', 'timeStamp'] }],
  },
};

module.exports = MeterLoadProfileSchema;
