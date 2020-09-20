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
    'sync-data': {
      query: {
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
        const { clear } = ctx.params;

        this.entityChanged('clear', ctx.broker);

        ctx.broker.logger.info('[plant][event][plant.synced] - processing');

        if (clear) {
          await this.model.destroy({ truncate: true });
        }

        const data = await ctx.broker.call('v1.egat.plant', {});

        if (data) {
          await this.adapter.insertMany(data, { ignoreDuplicates: true });
          ctx.broker.logger.info('[plant][event][plant.synced] - complete');
        }
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
  },
  // afterConnected() {
  //   this.logger.info('Connected successfully');
  // },
};
