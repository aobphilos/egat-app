'use strict';

const DbService = require('moleculer-db');

const { DbAdapter } = require('../lib/db.adapter');
const { Weather3HoursObservation } = require('../models');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'weather.3hours.observation',
  version: 1,
  mixins: [DbService],
  adapter: DbAdapter,
  model: Weather3HoursObservation,
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
    bulkCreate: {
      params: {
        clear: { type: 'boolean', default: false, optional: true, convert: true },
        data: { type: 'array', items: 'object' },
      },
      async handler(ctx) {
        return this.doInsertMany(ctx);
      },
    },
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    async doInsertMany(ctx) {
      const { clear, data } = ctx.params;
      ctx.broker.logger.info('[weather.3hours.observation][methods][doInsertMany] : clear', clear);

      if (clear) {
        await this.adapter.clear();
      }

      const result = {};
      if (Array.isArray(data) && data.length > 0) {
        // const rows = await this.adapter.insertMany(data);
        const rows = await this.adapter.insertMany(data, {
          ignoreDuplicates: false,
          updateOnDuplicate: Object.keys(Weather3HoursObservation.define),
        });
        ctx.broker.logger.info('[weather.3hours.observation][methods][doInsertMany] - completed');
        Object.assign(result, { data: rows });
      } else {
        ctx.broker.logger.warn('[weather.3hours.observation][methods][doInsertMany] - skipped');
      }

      return { status: 'Completed', ...result };
    },
  },
};
