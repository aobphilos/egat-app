'use strict';

const DbService = require('moleculer-db');
const { DbAdapter } = require('../lib/db.adapter');
const { MeterLoadProfile } = require('../models');
const { Op } = require('sequelize');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'meter.load.profiles',
  version: 1,
  mixins: [DbService],
  adapter: DbAdapter,
  model: MeterLoadProfile,
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
    clear: {
      async handler() {
        return this.adapter.clear();
      },
    },
    import: {
      bulkhead: {
        enabled: true,
        concurrency: 8,
        maxQueueSize: 0,
      },
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
        ppinitial: { type: 'string' },
        year: { type: 'number', optional: true, default: 2020, convert: true },
        month: { type: 'number', optional: true, default: 1, convert: true },
      },
      async handler(ctx) {
        return this.importData(ctx);
      },
    },
    'sync-data': {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
        ppinitial: { type: 'string' },
        year: { type: 'number', optional: true, default: 2020, convert: true },
        month: { type: 'number', optional: true, default: 1, convert: true },
      },
      handler(ctx) {
        ctx.broker.emit('meter.load.profile.synced', ctx.params);
        return { status: 'InProgress' };
      },
    },
  },

  /**
   * Events
   */
  events: {
    'meter.load.profile.synced': {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
        ppinitial: { type: 'string' },
        year: { type: 'number', default: 2020, convert: true },
        month: { type: 'number', default: 1, convert: true },
      },
      async handler(ctx) {
        this.entityChanged('clear', ctx.broker);
        await this.importData(ctx);
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
    async importData(ctx) {
      const { clear, ...reqParams } = ctx.params;

      ctx.broker.logger.info('[meter.load.profile][methods][synced] - processing -', reqParams);

      if (clear) {
        const { year, month } = reqParams;
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-01`);
        endDate.setMonth(month);
        await this.model.destroy({
          where: {
            initialName: reqParams.ppinitial,
            timeStamp: { [Op.gte]: startDate, [Op.lt]: endDate },
          },
        });
      }

      const data = await ctx.broker.call('v1.egat.meter.load.profile', reqParams);
      if (Array.isArray(data) && data.length > 0) {
        return this.adapter
          .insertMany(data, { ignoreDuplicates: true })
          .then(() =>
            ctx.broker.logger.info('[meter.load.profile][methods][synced] - completed -', reqParams)
          );
      }

      ctx.broker.logger.warn('[meter.load.profile][methods][synced] - skipped -', reqParams);

      return Promise.resolve({});
    },
  },
};
