'use strict';
const { Promise } = require('bluebird');
const { min } = require('sequelize/lib/model');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'batch',
  version: 1,
  /**
   * Settings
   */
  settings: {},

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    import: {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
        minYear: { type: 'number', default: 2015, optional: true, convert: true },
        maxYear: { type: 'number', default: 2020, optional: true, convert: true },
      },
      async handler(ctx) {
        ctx.broker.emit('batch.imported', ctx.params);
        return { status: 'InProgress' };
      },
    },
  },

  /**
   * Events
   */
  events: {
    'batch.imported': {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
        minYear: { type: 'number', default: 2015, optional: true, convert: true },
        maxYear: { type: 'number', default: 2020, optional: true, convert: true },
      },
      async handler(ctx) {
        const { clear, minYear, maxYear } = ctx.params;

        await this.clearData(clear);
        const { jobs } = await this.importPlantData(minYear, maxYear);
        await this.importMeterLoadProfileData(jobs);
      },
    },
  },

  /**
   * Methods
   */
  methods: {
    cleanObject(dbItem) {
      // Filter out the data from db object before sending it to the client
      const { dataValues } = dbItem || {};
      return dataValues || {};
    },
    async clearData(clear) {
      if (clear) {
        await Promise.all([
          this.broker.call('v1.meter.load.profiles.clear'),
          this.broker.call('v1.plants.clear'),
        ]);
      }
    },
    async importPlantData(minYear, maxYear) {
      const defaultMaxYear = maxYear || new Date().getFullYear();
      const defaultMinYear = minYear || defaultMaxYear - 1;
      const { data } = await this.broker.call('v1.plants.import');
      const jobs = [];
      if (Array.isArray(data)) {
        for (let year = defaultMinYear; year <= defaultMaxYear; year++) {
          for (let month = 1; month <= 12; month++) {
            const items = data.map((m) => ({
              ppinitial: m.ppInitial,
              year,
              month,
            }));
            jobs.push(...items);
          }
        }
      }
      return { jobs };
    },
    async importMeterLoadProfileData(jobs) {
      await Promise.map(jobs, (job) => this.broker.call('v1.meter.load.profiles.import', job), {
        concurrency: 8,
      });
    },
  },
};
