const SequelizeAdapter = require('moleculer-db-adapter-sequelize');
const { DB_URL } = require('./config');

module.exports = {
  DbAdapter: new SequelizeAdapter(DB_URL, { logging: false }),
};
