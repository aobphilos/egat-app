'use strict';

const DbService = require('moleculer-db');
const { DbAdapter } = require('../lib/db.adapter');
const { Plant } = require('../models');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'plants',
  version: 1,
  mixins: [DbService],
  adapter: DbAdapter,
  model: Plant,
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
      },
      async handler(ctx) {
        return this.importData(ctx);
      },
    },
    'sync-data': {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
      },
      handler(ctx) {
        ctx.broker.emit('plant.synced', ctx.params);
        return { status: 'InProgress' };
      },
    },
  },

  /**
   * Events
   */
  events: {
    'plant.synced': {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
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
      ctx.broker.logger.info('[plant][methods][import] - processing');
      const { clear } = ctx.params;

      if (clear) {
        await this.adapter.clear();
      }

      const result = {};
      const data = await ctx.broker.call('v1.egat.plant', {});
      if (Array.isArray(data) && data.length > 0) {
        const rows = await this.adapter.insertMany(data, { ignoreDuplicates: true });
        ctx.broker.logger.info('[plant][methods][import] - completed');
        Object.assign(result, { data: rows.map(this.cleanObject) });
      } else {
        ctx.broker.logger.warn('[plant][methods][import] - skipped');
      }

      return { status: 'Completed', ...result };
    },
  },
  // afterConnected() {
  //   this.logger.info('Connected successfully');
  // },
};
