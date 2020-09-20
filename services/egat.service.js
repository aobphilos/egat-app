'use strict';

const axios = require('moleculer-axios');
const E = require('moleculer-web').Errors;

const { EGAT_URL, EGAT_USER, EGAT_PASSWORD, CACHE_TTL } = require('../lib/config');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'egat',
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
    plant: {
      async handler(ctx) {
        // Check the token
        const url = `${EGAT_URL}/plant`;
        const token = await this.getToken();
        const config = {
          headers: { authorization: `Bearer ${token}` },
        };
        const { status, data } = await this.axios
          .get(url, config)
          .catch(() => Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN)));
        return data;
      },
    },
    'meter.load.profile': {
      params: {
        ppinitial: { type: 'string' },
        year: { type: 'number', default: 2020 },
        month: { type: 'number', default: 1 },
      },
      async handler(ctx) {
        // Check the token
        const url = `${EGAT_URL}/meter/loadprofile`;
        const token = await this.getToken();
        const config = {
          headers: { authorization: `Bearer ${token}` },
          params: ctx.params,
        };
        const { status, data } = await this.axios
          .get(url, config)
          .catch(() => Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN)));
        return data;
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
    getToken: {
      async handler() {
        const token = await this.broker.cacher.get('EGAT-TOKEN');
        if (token) {
          return token;
        }

        const url = `${EGAT_URL}/auth/gettoken`;
        const config = {
          username: EGAT_USER,
          password: EGAT_PASSWORD,
        };
        const { data } = await this.axios.post(url, config).catch(() => Promise.reject());

        await this.broker.cacher.set('EGAT-TOKEN', data.tokenString, CACHE_TTL);
        return data.tokenString;
      },
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
