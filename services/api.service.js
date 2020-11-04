'use strict';

const ApiGateway = require('moleculer-web');
const {
  HTTP_RATE_LIMIT_ENABLE,
  HTTP_RATE_LIMIT_HEADERS_ENABLE,
  HTTP_RATE_LIMIT_TTL,
  HTTP_RATE_LIMIT_THRESHOLD,
} = require('../lib/config');

const bodyParsers = {
  json: {
    strict: false,
    limit: '1MB',
  },
  urlencoded: {
    extended: true,
    limit: '1MB',
  },
};

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

module.exports = {
  name: 'api',
  mixins: [ApiGateway],

  // More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
  settings: {
    // Exposed port
    port: process.env.PORT || 3377,

    // Exposed IP
    ip: '0.0.0.0',

    // Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
    use: [],

    cors: {
      // Configures the Access-Control-Allow-Origin CORS header.
      origin: '*',
    },

    rateLimit: HTTP_RATE_LIMIT_ENABLE
      ? {
          // How long to keep record of requests in memory (in milliseconds).
          // Defaults to 60000 (1 min)
          window: HTTP_RATE_LIMIT_TTL * 1000,
          // Max number of requests during window. Defaults to 20
          limit: HTTP_RATE_LIMIT_THRESHOLD,
          // // Set rate limit headers to response. Defaults to false
          headers: HTTP_RATE_LIMIT_HEADERS_ENABLE,
          // // Function used to generate keys. Defaults to:
          // key: (req) => req.headers['x-forwarded-for']
          //     || req.connection.remoteAddress
          //     || req.socket.remoteAddress
          //     || req.connection.socket.remoteAddress,
        }
      : undefined,

    routes: [
      {
        path: '/api/v1/',
        onBeforeCall(ctx, route, req) {
          return this.handleBeforeCall(ctx, route, req);
        },
        onAfterCall(ctx, route, req, res, data) {
          return this.handleAfterCall(ctx, route, req, res, data);
        },
        bodyParsers,
        mappingPolicy: 'restrict',
        aliases: {
          'GET /egat/plant': 'v1.egat.plant',
          'GET /egat/meter/load/profile': 'v1.egat.meter.load.profile',

          'GET /tmd/weather/3hours': 'v1.tmd.weather.get3hours',

          'GET /plants/list': 'v1.plants.list',
          'POST /plants/sync-data': 'v1.plants.sync-data',

          'GET /meter/load/profiles/list': 'v1.meter.load.profiles.list',
          'POST /meter/load/profiles/sync-data': 'v1.meter.load.profiles.sync-data',

          'POST /batch/import': 'v1.batch.import',
        },
      },
    ],

    // Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
    log4XXResponses: false,
    // Logging the request parameters. Set to any log level to enable it. E.g. "info"
    logRequestParams: null,
    // Logging the response data. Set to any log level to enable it. E.g. "info"
    logResponseData: null,

    // Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
    assets: {
      folder: 'public',

      // Options to `server-static` module
      options: {},
    },
  },

  methods: {
    /**
     * Authenticate the request. It check the `Authorization` token value in the request header.
     * Check the token value & resolve the user by the token.
     * The resolved user will be available in `ctx.meta.user`
     *
     * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
     *
     * @param {Context} ctx
     * @param {Object} route
     * @param {IncomingRequest} req
     * @returns {Promise}
     */
    async authenticate(ctx, route, req) {
      // Read the token from header
      const auth = req.headers['authorization'];

      if (auth && auth.startsWith('Bearer')) {
        const token = auth.slice(7);

        // Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
        if (token == '123456') {
          // Returns the resolved user. It will be set to the `ctx.meta.user`
          return { id: 1, name: 'John Doe' };
        } else {
          // Invalid token
          throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
        }
      } else {
        // No token. Throw an error or do nothing if anonymous access is allowed.
        // throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
        return null;
      }
    },

    /**
     * Authorize the request. Check that the authenticated user has right to access the resource.
     *
     * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
     *
     * @param {Context} ctx
     * @param {Object} route
     * @param {IncomingRequest} req
     * @returns {Promise}
     */
    async authorize(ctx, route, req) {
      // Get the authenticated user.
      const user = ctx.meta.user;

      // It check the `auth` property in action schema.
      if (req.$action.auth == 'required' && !user) {
        throw new ApiGateway.Errors.UnAuthorizedError('NO_RIGHTS');
      }
    },

    handleBeforeCall(ctx, route, req) {
      // Set request headers to context meta
      ctx.meta.userAgent = req.headers['user-agent'];
    },
    handleAfterCall(ctx, route, req, res, data) {
      // Async function which return with Promise
      res.setHeader('x-service-namespace', 'egat-service');
      const actionInput = (req.$alias && req.$alias.action) || 'unknown';
      const paramsInput = req.$params ? JSON.stringify(req.$params) : 'unknown';
      this.logger.info(`[API][${actionInput}] - ${paramsInput}`);
      return data;
    },
  },
};
