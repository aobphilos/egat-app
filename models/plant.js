const { DataTypes } = require('sequelize');

const PlantSchema = {
  name: 'plant',
  define: {
    ppInitial: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    ppThaiName: DataTypes.STRING,
    provinceName: DataTypes.STRING,
    ppLatitude: DataTypes.STRING,
    ppLongtitude: DataTypes.STRING,
    fuelName: DataTypes.STRING,
    ppaPowerInstall: DataTypes.DECIMAL,
    ppaPowerContracted: DataTypes.DECIMAL,
    codDate: DataTypes.DATE,
  },
  options: {
    timestamps: false,
    indexes: [{ unique: true, fields: ['ppInitial'] }],
  },
};

module.exports = PlantSchema;
