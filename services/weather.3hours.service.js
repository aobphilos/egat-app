'use strict';
const _ = require('lodash');
const { DateTime } = require('luxon');
const Cron = require('moleculer-cron');
const { Weather3HoursStation, Weather3HoursObservation } = require('../models');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
  name: 'weather.3hours',
  version: 1,
  mixins: [Cron],
  /**
   * Settings
   */
  settings: {
    dateTimeFormat: 'MM/dd/yyyy hh:mm:ss',
  },

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Cron Jobs
   */
  crons: [
    {
      name: 'jobUpdateWeather3Hours',

      // every minute
      // cronTime: '* * * * *',

      // At minute 30 past every 3rd hour from 0 through 23.
      cronTime: '30 0-23/3 * * *',

      onTick: function () {
        this.logger.info('jobUpdateWeather3Hours ticked');
        this.emit('weather.3hours.synced');
      },
      manualStart: true,
      timeZone: 'Asia/Bangkok',
    },
  ],

  /**
   * Actions
   */
  actions: {},

  /**
   * Events
   */
  events: {
    'weather.3hours.synced': {
      async handler(ctx) {
        ctx.broker.logger.info('Sync weather data has triggered by Cron');
        await this.updateData(ctx);
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

    buildStationObject(data) {
      const { observation, ...result } = data;
      return { ...result };
    },

    buildObservationObject(data) {
      const { wmoStationNumber, observation } = data;
      const dateTime = DateTime.fromFormat(
        observation.dateTime,
        this.settings.dateTimeFormat
      ).toJSDate();
      return {
        ...observation,
        wmoStationNumber,
        dateTime,
      };
    },

    async updateData(ctx) {
      ctx.broker.logger.info('[weather.3hours][methods][updateData] - processing');
      const result = {};
      const { weather3Hours } = await ctx.broker.call('v1.tmd.weather.get3hours');

      if (!weather3Hours || !weather3Hours.stations) return { status: 'Failed' };

      const { station } = weather3Hours.stations;

      if (!Array.isArray(station) || station.length <= 0) return { status: 'Failed' };

      const stationData = station.map(this.buildStationObject);
      await ctx.broker.call('v1.weather.3hours.station.bulkCreate', {
        data: _.uniqBy(stationData, 'wmoStationNumber'),
      });

      const observationData = station.map(this.buildObservationObject);
      await ctx.broker.call('v1.weather.3hours.observation.bulkCreate', {
        data: _.uniqBy(observationData, 'wmoStationNumber'),
      });

      ctx.broker.logger.info('[weather.3hours][methods][updateData] - completed');

      return { status: 'Completed', ...result };
    },
  },

  async started() {
    await this.broker.waitForServices(
      ['v1.tmd.weather', 'v1.weather.3hours.station', 'v1.weather.3hours.observation'],
      3000,
      500
    );

    setTimeout(() => {
      // fetch latest data
      this.broker.emit('weather.3hours.synced');

      const job = this.getJob('jobUpdateWeather3Hours');
      if (!job.lastDate()) {
        job.start();
      } else {
        this.broker.logger.info('jobUpdateWeather3Hours is already started!');
      }
    }, 1000);
  },
};
