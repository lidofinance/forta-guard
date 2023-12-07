import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { getConfig } from './utils/config'
import * as E from 'fp-ts/Either'
import { HealthHandler } from './handlers/health'
import { Routes } from './handlers/routes'
import { SecretSrv } from './services/secret'
import { SecretHlr } from './handlers/secrets'
import { FortaTokenMiddleware } from './handlers/middlewares/forta_jwt'
import { requestLoggerMiddleware } from './handlers/middlewares/request'
import promBundle from 'express-prom-bundle'
import { collectDefaultMetrics, Gauge } from 'prom-client'
import winston, { transports } from 'winston'
import expressWinston from 'express-winston'

function main() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new transports.Console()],
  })

  const config = getConfig()
  if (E.isLeft(config)) {
    console.log(config.left)
    process.exit(1)
  }

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    )
  }

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  })

  const healthInfo = new Gauge({
    name: config.right.metricPrefix + 'health_info',
    help: 'Health information',
  })

  const secretSrv = new SecretSrv(config.right.store)
  const secretH = new SecretHlr(secretSrv)
  const healtH = new HealthHandler(healthInfo)

  const fortaJWTMiddleware = new FortaTokenMiddleware(config.right.nodeEnv == 'production')
  const metricsMiddleware = promBundle({
    includeMethod: true,
    autoregister: true,
  })

  collectDefaultMetrics({ prefix: config.right.metricPrefix })

  const app = express()

  app.use(metricsMiddleware)
  app.use(limiter)
  app.use(requestLoggerMiddleware)
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
      ),
      meta: true, // optional: control whether you want to log the meta data about the request (default to true)
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ignoreRoute: function (req, _res) {
        return req.url == Routes.health || req.url == Routes.metrics
      }, // optional: allows to skip some log messages based on request and/or response
    }),
  )

  app.get(Routes.health, (req, res) => healtH.health(req, res))
  app.get(Routes.secret, fortaJWTMiddleware.verifyToken(), (req, res) => secretH.getSecret(req, res))

  const startInfo = {
    env: config.right.nodeEnv,
    name: config.right.appName,
  }

  const buildInfo = new Gauge({
    name: config.right.metricPrefix + 'build_info',
    help: 'Build information',
    labelNames: ['name', 'env'],
  })

  buildInfo.labels(startInfo).inc()

  app.listen(config.right.port, () => {
    logger.info(`App listening on port ${config.right.port}`)
  })
}

main()
