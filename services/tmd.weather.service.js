'use strict';

const axios = require('moleculer-axios');
const E = require('moleculer-web').Errors;

const xml2js = require('xml2js');

const { TMD_WEATHER_URL, TMD_WEATHER_UID, TMD_WEATHER_UKEY } = require('../lib/config');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'tmd.weather',
  version: 1,
  mixins: [axios],
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
    get3hours: {
      async handler(ctx) {
        // Check the token
        ctx.broker.logger.info('[tmd.weather][actions][get3hours]');
        const url = TMD_WEATHER_URL;
        const config = {
          params: { uid: TMD_WEATHER_UID, ukey: TMD_WEATHER_UKEY },
        };
        const { data } = await this.axios
          .get(url, config)
          .catch(() => Promise.reject(new E.BadRequestError()));
        return this.convert2Json(data);
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
    async convert2Json(xmlData) {
      // Convert XML to JSON before sending outside
      const options = {
        explicitArray: false,
        ignoreAttrs: true,
        tagNameProcessors: [(name) => xml2js.processors.firstCharLowerCase(name)],
      };
      // Without parser
      return xml2js
        .parseStringPromise(xmlData, options)
        .then((result) => {
          this.broker.logger.info('[tmd.weather][methods][convert2Json] - done');
          return result;
        })
        .catch((err) => {
          this.broker.logger.error('[tmd.weather][methods][convert2Json] - ', err.message);
          return null;
        });
    },
  },

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  async started() {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};
